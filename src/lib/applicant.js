const APPLICANT_KEY = '4ef_applicant';

export function saveApplicant(data) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(APPLICANT_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[4ef] failed to persist applicant', err);
  }
}

export function getApplicant() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(APPLICANT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
