const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '2648013695654097';
const LEAD_KEY = 'meta_event_lead';
const SCHEDULE_KEY = 'meta_event_schedule';
const SENT_KEY = 'meta_capi_sent';
const inflight = new Set();

function readStorage(key) {
  try {
    return sessionStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function writeStorage(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function generateEventId(prefix) {
  const rand = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${rand}`;
}

export function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function getFbp() {
  return getCookie('_fbp');
}

export function getFbc() {
  const cookie = getCookie('_fbc');
  if (cookie) return cookie;
  if (typeof window === 'undefined') return '';
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (!fbclid) return '';
  return `fb.1.${Date.now()}.${fbclid}`;
}

export function persistEventId(key, eventId) {
  if (eventId) writeStorage(key, eventId);
  return eventId;
}

export function getLeadEventId() {
  return readStorage(LEAD_KEY);
}

export function getScheduleEventId() {
  return readStorage(SCHEDULE_KEY);
}

export function setLeadEventId(eventId) {
  return persistEventId(LEAD_KEY, eventId || generateEventId('lead'));
}

export function setScheduleEventId(eventId) {
  return persistEventId(SCHEDULE_KEY, eventId || generateEventId('schedule'));
}

function stamp(eventName, eventId) {
  return `${eventName}:${eventId}`;
}

function wasSent(eventName, eventId) {
  const key = stamp(eventName, eventId);
  if (inflight.has(key)) return true;
  try {
    return JSON.parse(readStorage(SENT_KEY) || '[]').includes(key);
  } catch {
    return false;
  }
}

function markSent(eventName, eventId) {
  const key = stamp(eventName, eventId);
  inflight.add(key);
  try {
    const sent = JSON.parse(readStorage(SENT_KEY) || '[]');
    if (!sent.includes(key)) writeStorage(SENT_KEY, JSON.stringify([...sent, key].slice(-40)));
  } catch {
    /* ignore */
  }
}

export function trackPixel(eventName, params = {}, eventId) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function' || !eventId) return;
  window.fbq('track', eventName, params, { eventID: eventId });
}

export function capiBrowserContext(extra = {}) {
  return {
    fbp: getFbp() || undefined,
    fbc: getFbc() || undefined,
    event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ...extra,
  };
}

export async function sendCapi(payload) {
  const eventName = payload.eventName;
  const eventId = payload.eventId;
  if (!eventName || !eventId) return { ok: false };
  if (wasSent(eventName, eventId)) return { ok: true, duplicate: true };
  inflight.add(stamp(eventName, eventId));

  try {
    const res = await fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        ...capiBrowserContext(),
        ...payload,
      }),
    });
    const data = await res.json().catch(() => ({ ok: res.ok }));
    if (data.ok) markSent(eventName, eventId);
    return data;
  } catch (err) {
    console.error('[capi] browser send failed', err);
    return { ok: false };
  }
}

export function dualFire(eventName, { eventId, pixelParams, skipPixel, ...capiFields } = {}) {
  const id = eventId || generateEventId(eventName.toLowerCase());
  if (!skipPixel) trackPixel(eventName, pixelParams || {}, id);
  void sendCapi({ eventName, eventId: id, ...capiFields });
  return id;
}

export { PIXEL_ID, LEAD_KEY, SCHEDULE_KEY };
