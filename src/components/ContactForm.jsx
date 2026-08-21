import { useMemo, useState } from 'react';
import { saveApplicant } from '../lib/applicant';
import { capiBrowserContext, setLeadEventId, trackPixel } from '../lib/meta';
import { submitApplication } from '../lib/submit';
import { FUNNEL_ID, getSessionId, getVisitorId, submitLead, trackEvent } from '../lib/sweep';
import {
  PHONE_COUNTRIES,
  countryCallingCode,
  formatPhoneInput,
  splitName,
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
    const visitorId = getVisitorId();
    const idempotencyKey = `${FUNNEL_ID}_${SUBMIT_EVENT}_${sessionId}_root-quiz`;
    const { first_name, last_name } = splitName(validation.values.name);
    const contactFields = {
      name: validation.values.name,
      first_name,
      last_name,
      email: validation.values.email,
      phone: validation.values.phone,
      instagram: validation.values.instagram,
    };

    trackEvent(
      SUBMIT_EVENT,
      {
        form_id: 'root-quiz',
        ...contactFields,
        quiz_answers: answers,
        contact: contactFields,
      },
      idempotencyKey
    );

    saveApplicant(contactFields);

    const leadEventId = setLeadEventId();
    trackPixel('Lead', { content_name: 'PrimeShift quiz' }, leadEventId);
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('init', import.meta.env.VITE_META_PIXEL_ID || '2648013695654097', {
        em: contactFields.email,
        ph: contactFields.phone,
        fn: first_name,
        ln: last_name,
        external_id: visitorId,
      });
    }

    await Promise.all([
      submitLead({
        ...contactFields,
        visitor_id: visitorId,
        session_id: sessionId,
        source: 'quiz',
        funnel_step_reached: SUBMIT_EVENT,
        quiz_answers: answers,
        notes: `Completed 4EverFitness PrimeShift quiz. Instagram: ${contactFields.instagram}`,
      }),
      submitApplication({
        ...contactFields,
        quiz_answers: answers,
        event_id: leadEventId,
        ...capiBrowserContext(),
      }),
    ]);

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
