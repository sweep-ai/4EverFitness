import { buildCapiEvent, buildUserData, clientIpFromHeaders, sendCapiEvents } from './capi.js';

export function capiContextFromRequest(req, fields = {}) {
  const headers = req.headers || {};
  return {
    client_ip_address: fields.client_ip_address || clientIpFromHeaders(headers),
    client_user_agent: fields.client_user_agent || headers['user-agent'] || headers['User-Agent'],
  };
}

export async function sendMetaCapi(env, req, {
  eventName,
  eventId,
  eventSourceUrl,
  customData,
  ...fields
}) {
  if (!eventName || !eventId) {
    return { ok: false, error: 'eventName and eventId are required' };
  }

  const request = capiContextFromRequest(req, fields);
  const userData = buildUserData(fields, request);
  if (!Object.keys(userData).length) {
    return { ok: false, error: 'CAPI user_data is empty' };
  }

  const event = buildCapiEvent({
    eventName,
    eventId,
    eventSourceUrl: eventSourceUrl || fields.event_source_url,
    userData,
    customData,
  });

  return sendCapiEvents(env, [event]);
}
