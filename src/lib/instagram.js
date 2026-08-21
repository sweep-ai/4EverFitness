const HANDLE = (import.meta.env.VITE_INSTAGRAM_HANDLE || 'andrewaguilarjr').replace(/^@/, '');
const KEYWORD = import.meta.env.VITE_DM_KEYWORD || 'Tortilla';
export const MANYCHAT_REF_URL = 'https://ig.me/m/andrewaguilarjr?ref=QUALIFIED';

export function isInstagramInApp() {
  if (typeof navigator === 'undefined') return false;
  return /Instagram/i.test(navigator.userAgent);
}

export function getDmKeyword() {
  return KEYWORD;
}

export function getInstagramHandle() {
  return HANDLE;
}

export function getManyChatHref() {
  return import.meta.env.VITE_MANYCHAT_URL || MANYCHAT_REF_URL;
}

/** Direct ig.me URL. Instagram’s in-app browser only opens DMs on a real user tap. */
export function getManyChatButtonHref() {
  return getManyChatHref();
}
