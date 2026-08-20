import { useEffect, useRef } from 'react';
import { getApplicant } from '../lib/applicant';

const CALENDLY_URL =
  import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/andrewaguilar-agiluna/1-1-strategy-call';
const WIDGET_SRC = 'https://assets.calendly.com/assets/external/widget.js';

let scriptPromise;

function loadCalendlyScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${WIDGET_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return scriptPromise;
}

function buildUrl() {
  const url = new URL(CALENDLY_URL);
  url.searchParams.set('hide_gdpr_banner', '1');
  url.searchParams.set('background_color', '0d0d0d');
  url.searchParams.set('text_color', 'ffffff');
  url.searchParams.set('primary_color', 'b91c1c');
  const applicant = getApplicant();
  if (applicant?.name) url.searchParams.set('name', applicant.name);
  if (applicant?.email) url.searchParams.set('email', applicant.email);
  return url.toString();
}

export default function CalendlyEmbed({ onScheduled }) {
  const containerRef = useRef(null);
  const onScheduledRef = useRef(onScheduled);
  onScheduledRef.current = onScheduled;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    let cancelled = false;

    void loadCalendlyScript().then(() => {
      if (cancelled || !containerRef.current || !window.Calendly) return;
      containerRef.current.innerHTML = '';
      window.Calendly.initInlineWidget({
        url: buildUrl(),
        parentElement: containerRef.current,
      });
    });

    function handleMessage(event) {
      const data = event.data;
      if (!data || data.event !== 'calendly.event_scheduled') return;
      onScheduledRef.current?.(data);
    }

    window.addEventListener('message', handleMessage);
    return () => {
      cancelled = true;
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return <div ref={containerRef} className="calendly-embed" />;
}
