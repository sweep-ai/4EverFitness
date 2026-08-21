import { createHash } from 'node:crypto';

export const META_PIXEL_ID = '2648013695654097';
export const META_GRAPH_VERSION = 'v21.0';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function normalizeName(part) {
  return String(part || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-zà-ÿ]/g, '');
}

function hashIfPresent(normalized) {
  if (!normalized) return undefined;
  return sha256(normalized);
}

export function buildUserData(fields = {}, request = {}) {
  const userData = {};
  const em = hashIfPresent(normalizeEmail(fields.email));
  const ph = hashIfPresent(normalizePhone(fields.phone));
  const fn = hashIfPresent(normalizeName(fields.first_name || fields.firstName));
  const ln = hashIfPresent(normalizeName(fields.last_name || fields.lastName));
  const externalId = hashIfPresent(String(fields.visitor_id || '').trim());

  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];
  if (fn) userData.fn = [fn];
  if (ln) userData.ln = [ln];
  if (externalId) userData.external_id = [externalId];
  if (fields.fbp) userData.fbp = fields.fbp;
  if (fields.fbc) userData.fbc = fields.fbc;
  if (request.client_ip_address) userData.client_ip_address = request.client_ip_address;
  if (request.client_user_agent) userData.client_user_agent = request.client_user_agent;
  return userData;
}

export function clientIpFromHeaders(headers = {}) {
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '';
  const raw = Array.isArray(forwarded) ? forwarded[0] : String(forwarded).split(',')[0];
  const ip = raw.trim();
  if (!ip || ip === '::1' || ip.startsWith('127.')) return undefined;
  return ip;
}

export async function sendCapiEvents(env, events, { testEventCode, headers } = {}) {
  const token = (env.CAPI_TOKEN || env.META_CAPI_TOKEN || '').trim();
  const pixelId = (env.META_PIXEL_ID || env.VITE_META_PIXEL_ID || META_PIXEL_ID).trim();
  if (!token) return { ok: false, error: 'CAPI_TOKEN is not configured' };
  if (!events?.length) return { ok: false, error: 'No CAPI events' };

  const body = { data: events };
  const testCode = testEventCode || env.CAPI_TEST_EVENT_CODE || env.META_TEST_EVENT_CODE;
  if (testCode) body.test_event_code = testCode;

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers?.['user-agent'] ? { 'User-Agent': headers['user-agent'] } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    return {
      ok: false,
      status: res.status,
      error: data.error?.message || `CAPI HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    events_received: data.events_received,
    fbtrace_id: data.fbtrace_id,
    messages: data.messages,
  };
}

export function buildCapiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData,
  customData,
  eventTime,
}) {
  const event = {
    event_name: eventName,
    event_time: eventTime || Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    user_data: userData,
  };
  if (eventSourceUrl) event.event_source_url = eventSourceUrl;
  if (customData && Object.keys(customData).length) event.custom_data = customData;
  return event;
}
