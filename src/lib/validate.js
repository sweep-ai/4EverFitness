import { AsYouType, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/max';

const EMAIL_RE =
  /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

const INSTAGRAM_RE = /^[a-zA-Z0-9._]{1,30}$/;

export const PHONE_COUNTRIES = [
  { iso: 'US', name: 'United States' },
  { iso: 'MX', name: 'Mexico' },
  { iso: 'PR', name: 'Puerto Rico' },
  { iso: 'DO', name: 'Dominican Republic' },
  { iso: 'CO', name: 'Colombia' },
  { iso: 'AR', name: 'Argentina' },
  { iso: 'PE', name: 'Peru' },
  { iso: 'CL', name: 'Chile' },
  { iso: 'EC', name: 'Ecuador' },
  { iso: 'GT', name: 'Guatemala' },
  { iso: 'HN', name: 'Honduras' },
  { iso: 'SV', name: 'El Salvador' },
  { iso: 'NI', name: 'Nicaragua' },
  { iso: 'CR', name: 'Costa Rica' },
  { iso: 'PA', name: 'Panama' },
  { iso: 'VE', name: 'Venezuela' },
  { iso: 'BO', name: 'Bolivia' },
  { iso: 'PY', name: 'Paraguay' },
  { iso: 'UY', name: 'Uruguay' },
  { iso: 'CU', name: 'Cuba' },
  { iso: 'ES', name: 'Spain' },
  { iso: 'BR', name: 'Brazil' },
  { iso: 'CA', name: 'Canada' },
  { iso: 'GB', name: 'United Kingdom' },
];

export function countryCallingCode(iso) {
  try {
    return `+${getCountryCallingCode(iso)}`;
  } catch {
    return '+1';
  }
}

export function validateName(value) {
  const name = (value || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2) return { ok: false, error: 'Enter your full name.' };
  if (!name.includes(' ')) return { ok: false, error: 'Enter first and last name.' };
  if (!/^[a-zA-ZÀ-ÿ' .\-]+$/.test(name)) return { ok: false, error: 'Name can only contain letters.' };
  return { ok: true, value: name };
}

export function validateEmail(value) {
  const email = (value || '').trim().toLowerCase();
  if (!email) return { ok: false, error: 'Enter your email address.' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Enter a valid email address.' };
  return { ok: true, value: email };
}

export function formatPhoneInput(value, country) {
  const formatter = new AsYouType(country);
  return formatter.input(value || '');
}

export function validatePhone(value, country = 'US') {
  const raw = (value || '').trim();
  if (!raw) return { ok: false, error: 'Enter your phone number.' };
  const parsed = parsePhoneNumberFromString(raw, country);
  if (!parsed || !parsed.isValid()) {
    return { ok: false, error: 'Enter a valid phone number with country code.' };
  }
  return { ok: true, value: parsed.format('E.164') };
}

export function validateInstagram(value) {
  const handle = (value || '').trim().replace(/^@+/, '');
  if (!handle) return { ok: false, error: 'Enter your Instagram handle.' };
  if (!INSTAGRAM_RE.test(handle)) {
    return { ok: false, error: 'Handle can only use letters, numbers, periods, and underscores.' };
  }
  return { ok: true, value: `@${handle}` };
}

export function validateContact({ name, email, phone, country, instagram }) {
  const nameResult = validateName(name);
  const emailResult = validateEmail(email);
  const phoneResult = validatePhone(phone, country);
  const igResult = validateInstagram(instagram);

  return {
    ok: nameResult.ok && emailResult.ok && phoneResult.ok && igResult.ok,
    values: {
      name: nameResult.value,
      email: emailResult.value,
      phone: phoneResult.value,
      instagram: igResult.value,
    },
    errors: {
      name: nameResult.ok ? '' : nameResult.error,
      email: emailResult.ok ? '' : emailResult.error,
      phone: phoneResult.ok ? '' : phoneResult.error,
      instagram: igResult.ok ? '' : igResult.error,
    },
  };
}
