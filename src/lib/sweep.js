const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.sweepai.site';
const FUNNEL_ID = import.meta.env.VITE_FUNNEL_ID ?? '';

const VISITOR_KEY = 'sweep_visitor_id';
const SESSION_KEY = 'sweep_session_id';
const LEAD_QUEUE_KEY = 'sweep_lead_queue';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeId(prefix) {
  const rand = Math.random().toString(36).slice(2, 11);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function getVisitorId() {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = makeId('visitor');
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return makeId('visitor');
  }
}

export function getSessionId() {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = makeId('session');
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return makeId('session');
  }
}

function getUtmParams() {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) utm[key.replace('utm_', '')] = value;
  }
  return Object.keys(utm).length ? utm : undefined;
}

function readQueue() {
  try {
    const raw = localStorage.getItem(LEAD_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  try {
    if (!queue.length) {
      localStorage.removeItem(LEAD_QUEUE_KEY);
      return;
    }
    localStorage.setItem(LEAD_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[sweep] failed to persist lead queue', err);
  }
}

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const res = await fetch(url, options);
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < retries - 1) {
      await sleep(BASE_DELAY_MS * 2 ** attempt);
    }
  }
  throw lastError ?? new Error('network error');
}

export function trackEvent(eventName, metadata = {}, idempotencyKey) {
  if (!FUNNEL_ID || !eventName) {
    console.error('[sweep] FUNNEL_ID or event_name missing; skip trackEvent');
    return;
  }

  const body = {
    funnel_id: FUNNEL_ID,
    event_name: eventName,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    metadata: {
      ...metadata,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      utm: getUtmParams(),
    },
    event_timestamp: new Date().toISOString(),
  };
  if (idempotencyKey) body.idempotency_key = idempotencyKey;

  void (async () => {
    try {
      await fetchWithRetry(`${API_BASE_URL}/funnels/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error('[sweep] trackEvent failed', eventName, err);
    }
  })();
}

export async function submitLead(fields) {
  if (!FUNNEL_ID) {
    return { ok: false, error: 'FUNNEL_ID not configured' };
  }

  const payload = { funnel_id: FUNNEL_ID, ...fields };
  const queueId = fields._queueId || makeId('lead');
  const queued = { ...payload, _queueId: queueId };

  const queue = readQueue();
  if (!queue.some((item) => item._queueId === queueId)) {
    queue.push(queued);
    writeQueue(queue);
  }

  try {
    const { _queueId, ...body } = queued;
    const res = await fetchWithRetry(`${API_BASE_URL}/funnels/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.detail ?? res.statusText };
    }
    writeQueue(readQueue().filter((item) => item._queueId !== queueId));
    return { ok: true, clientId: data.client_id, created: data.created };
  } catch (err) {
    console.error('[sweep] submitLead failed; payload queued for retry', err);
    return { ok: false, error: err instanceof Error ? err.message : 'network error' };
  }
}

let draining = false;

export async function drainQueue() {
  if (draining) return;
  const queue = readQueue();
  if (!queue.length) return;
  draining = true;
  try {
    for (const item of queue) {
      await submitLead(item);
    }
  } finally {
    draining = false;
  }
}

export { FUNNEL_ID };
