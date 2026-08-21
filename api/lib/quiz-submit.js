import { sendMetaCapi } from './meta-capi.js';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_V1_BASE = 'https://rest.gohighlevel.com/v1';
const GHL_VERSION = '2021-07-28';
const GHL_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

function jsonHeaders(extra = {}) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': GHL_UA,
    ...extra,
  };
}

async function readJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function splitName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ') || parts[0],
  };
}

function ghlHeaders(token) {
  return jsonHeaders({
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
  });
}

async function ghlRequest(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: ghlHeaders(token),
    body: body == null ? undefined : JSON.stringify(body),
  });
  const data = await readJson(res);
  return { ok: res.ok, status: res.status, data };
}

async function resolveLocationId(token, env) {
  if (env.GHL_LOCATION_ID) return env.GHL_LOCATION_ID;

  const search = await ghlRequest(token, 'GET', `${GHL_BASE}/locations/search?limit=5`);
  const locations = search.data?.locations || search.data?.location || [];
  if (Array.isArray(locations) && locations[0]?.id) return locations[0].id;

  const v1 = await fetch(`${GHL_V1_BASE}/locations/`, {
    method: 'GET',
    headers: jsonHeaders({ Authorization: `Bearer ${token}` }),
  });
  const v1Data = await readJson(v1);
  const v1Locations = v1Data?.locations || v1Data?.location;
  if (Array.isArray(v1Locations) && v1Locations[0]?.id) return v1Locations[0].id;
  if (v1Locations?.id) return v1Locations.id;

  return '';
}

function contactPayload(fields, locationId) {
  const { firstName, lastName } = splitName(fields.name);
  const handle = String(fields.instagram || '').replace(/^@/, '');
  const payload = {
    firstName,
    lastName,
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    source: '4EverFitness Quiz',
    tags: ['4everfitness', 'quiz', 'qualified'],
    website: handle ? `https://instagram.com/${handle}` : undefined,
  };
  if (locationId) payload.locationId = locationId;
  return payload;
}

export async function createGhlContact(fields, env) {
  const token = (env.GHL_ACCESS_TOKEN || env.GHL_INTEGRATION_TOKEN || '').trim();
  if (!token) {
    return { ok: false, error: 'GHL_ACCESS_TOKEN is not configured' };
  }

  const locationId = await resolveLocationId(token, env);
  const payload = contactPayload(fields, locationId);

  if (locationId) {
    const upsert = await ghlRequest(token, 'POST', `${GHL_BASE}/contacts/upsert`, payload);
    if (upsert.ok) {
      return {
        ok: true,
        contactId: upsert.data?.contact?.id || upsert.data?.id,
        new: upsert.data?.new,
        data: upsert.data,
      };
    }

    const created = await ghlRequest(token, 'POST', `${GHL_BASE}/contacts/`, payload);
    if (created.ok) {
      return {
        ok: true,
        contactId: created.data?.contact?.id || created.data?.id,
        data: created.data,
      };
    }

    return {
      ok: false,
      error: created.data?.message || upsert.data?.message || `GHL HTTP ${created.status}`,
      status: created.status || upsert.status,
    };
  }

  const v1 = await fetch(`${GHL_V1_BASE}/contacts/`, {
    method: 'POST',
    headers: jsonHeaders({ Authorization: `Bearer ${token}` }),
    body: JSON.stringify(payload),
  });
  const v1Data = await readJson(v1);
  if (v1.ok) {
    return { ok: true, contactId: v1Data?.contact?.id || v1Data?.id, data: v1Data };
  }

  return {
    ok: false,
    error:
      v1Data?.message ||
      'GHL locationId is required. Set GHL_LOCATION_ID (sub-account ID from Settings → Business Profile).',
    status: v1.status,
  };
}

export async function submitSweep(fields, env) {
  const apiBase = (env.VITE_API_BASE_URL || 'https://api.sweepai.site').replace(/\/$/, '');
  const funnelId = env.VITE_FUNNEL_ID;
  if (!funnelId) return { ok: false, error: 'VITE_FUNNEL_ID is not configured' };

  const { firstName, lastName } = splitName(fields.name);
  const eventName = env.VITE_EVT_FORM_SUBMIT || 'form_submit';
  const visitorId = fields.visitor_id || `visitor_${Date.now()}`;
  const sessionId = fields.session_id || `session_${Date.now()}`;
  const contactMeta = {
    form_id: 'root-quiz',
    email: fields.email,
    name: fields.name,
    first_name: firstName,
    last_name: lastName,
    phone: fields.phone,
    instagram: fields.instagram,
    quiz_answers: fields.quiz_answers,
    contact: {
      email: fields.email,
      name: fields.name,
      phone: fields.phone,
      instagram: fields.instagram,
    },
  };

  const eventBody = {
    funnel_id: funnelId,
    event_name: eventName,
    visitor_id: visitorId,
    session_id: sessionId,
    metadata: contactMeta,
    event_timestamp: new Date().toISOString(),
    idempotency_key: fields.idempotency_key || `${funnelId}_${eventName}_${sessionId}_root-quiz`,
  };

  const leadBody = {
    funnel_id: funnelId,
    email: fields.email,
    name: fields.name,
    first_name: firstName,
    last_name: lastName,
    phone: fields.phone,
    instagram: fields.instagram,
    source: 'quiz',
    funnel_step_reached: eventName,
    quiz_answers: fields.quiz_answers,
    notes: `Completed 4EverFitness PrimeShift quiz. Instagram: ${fields.instagram || 'n/a'}`,
    visitor_id: visitorId,
    session_id: sessionId,
  };

  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

  const [eventRes, leadRes] = await Promise.all([
    fetch(`${apiBase}/funnels/events`, { method: 'POST', headers, body: JSON.stringify(eventBody) }),
    fetch(`${apiBase}/funnels/leads`, { method: 'POST', headers, body: JSON.stringify(leadBody) }),
  ]);

  const eventData = await readJson(eventRes);
  const leadData = await readJson(leadRes);

  return {
    ok: eventRes.ok && leadRes.ok,
    event: { status: eventRes.status, data: eventData },
    lead: { status: leadRes.status, data: leadData },
    error: eventRes.ok && leadRes.ok ? undefined : eventData.detail || leadData.detail || leadData.message,
  };
}

export async function handleQuizSubmit(fields, env, req = { headers: {} }) {
  const [sweep, ghl, capi] = await Promise.all([
    submitSweep(fields, env),
    createGhlContact(fields, env),
    fields.event_id
      ? sendMetaCapi(env, req, {
          eventName: 'Lead',
          eventId: fields.event_id,
          eventSourceUrl: fields.event_source_url,
          customData: { content_name: 'PrimeShift quiz', status: 'qualified' },
          ...fields,
        })
      : Promise.resolve({ ok: false, error: 'Lead event_id missing' }),
  ]);
  return {
    ok: Boolean(sweep.ok),
    sweep,
    ghl,
    capi,
  };
}
