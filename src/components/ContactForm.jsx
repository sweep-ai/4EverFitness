import { useMemo, useState } from 'react';
import { saveApplicant } from '../lib/applicant';
import { FUNNEL_ID, getSessionId, submitLead, trackEvent } from '../lib/sweep';
import {
  PHONE_COUNTRIES,
  countryCallingCode,
  formatPhoneInput,
  validateContact,
} from '../lib/validate';

const SUBMIT_EVENT = import.meta.env.VITE_EVT_FORM_SUBMIT || 'form_submit';

export default function ContactForm({ answers, onQualified }) {
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'US',
    instagram: '',
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validation = useMemo(
    () =>
      validateContact({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        country: contact.country,
        instagram: contact.instagram,
      }),
    [contact]
  );

  function setField(field, value) {
    setContact((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ name: true, email: true, phone: true, instagram: true });
    if (!validation.ok || submitting) return;

    setSubmitting(true);
    const sessionId = getSessionId();
    const idempotencyKey = `${FUNNEL_ID}_${SUBMIT_EVENT}_${sessionId}_root-quiz`;

    trackEvent(
      SUBMIT_EVENT,
      {
        form_id: 'root-quiz',
        quiz_answers: answers,
      },
      idempotencyKey
    );

    saveApplicant({
      name: validation.values.name,
      email: validation.values.email,
      phone: validation.values.phone,
      instagram: validation.values.instagram,
    });

    await submitLead({
      name: validation.values.name,
      email: validation.values.email,
      phone: validation.values.phone,
      instagram: validation.values.instagram,
      source: 'quiz',
      funnel_step_reached: SUBMIT_EVENT,
      quiz_answers: answers,
      notes: 'Completed 4EverFitness PrimeShift quiz',
    });

    onQualified();
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <p className="question">
        Where can we send more free resources? <span className="required">*</span>
      </p>

      <div className="field">
        <label htmlFor="full-name">Full name</label>
        <input
          id="full-name"
          autoComplete="name"
          value={contact.name}
          onChange={(e) => setField('name', e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        />
        {touched.name && validation.errors.name ? (
          <span className="field-error">{validation.errors.name}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="email">Best email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={contact.email}
          onChange={(e) => setField('email', e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
        {touched.email && validation.errors.email ? (
          <span className="field-error">{validation.errors.email}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="instagram">Instagram handle</label>
        <input
          id="instagram"
          autoComplete="username"
          placeholder="@yourhandle"
          value={contact.instagram}
          onChange={(e) => setField('instagram', e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, instagram: true }))}
        />
        {touched.instagram && validation.errors.instagram ? (
          <span className="field-error">{validation.errors.instagram}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="phone">Phone number</label>
        <div className="phone-row">
          <select
            aria-label="Country code"
            value={contact.country}
            onChange={(e) => {
              setField('country', e.target.value);
              setField('phone', '');
            }}
          >
            {PHONE_COUNTRIES.map((country) => (
              <option key={country.iso} value={country.iso}>
                {country.iso} {countryCallingCode(country.iso)}
              </option>
            ))}
          </select>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="Phone number"
            value={contact.phone}
            onChange={(e) => setField('phone', formatPhoneInput(e.target.value, contact.country))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          />
        </div>
        {touched.phone && validation.errors.phone ? (
          <span className="field-error">{validation.errors.phone}</span>
        ) : null}
      </div>

      <button className="submit" type="submit" disabled={!validation.ok || submitting}>
        {submitting ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  );
}
