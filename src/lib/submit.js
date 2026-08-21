import { FUNNEL_ID, getSessionId, getVisitorId } from './sweep';

const SUBMIT_EVENT = import.meta.env.VITE_EVT_FORM_SUBMIT || 'form_submit';

export async function submitApplication(fields) {
  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const payload = {
    ...fields,
    visitor_id: visitorId,
    session_id: sessionId,
    idempotency_key: `${FUNNEL_ID}_${SUBMIT_EVENT}_${sessionId}_root-quiz`,
  };

  const res = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    console.error('[submit] application failed', data);
    return { ok: false, ...data };
  }
  return data;
}
