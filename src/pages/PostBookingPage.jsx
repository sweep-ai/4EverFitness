import { useEffect } from 'react';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import WistiaPlayer from '../components/WistiaPlayer.jsx';
import { trackEvent } from '../lib/sweep';

const POST_BOOKING_VIEW = import.meta.env.VITE_EVT_POST_BOOKING_VIEW || 'post_booking_page_view';
const CONFIRM_PHONE = '+14074263304';
const CONFIRM_PHONE_LABEL = '+1 (407) 426-3304';
const EXCLUSIVE_URL = 'https://www.youtube.com/watch?v=-b4aXDAH5wk';
const TOTAL_STEPS = 5;

const TESTIMONIALS = [
  { name: 'Jose', mediaId: 'wt50jhe7m0' },
  { name: 'Armando', mediaId: 'ognd5z9jdn' },
  { name: 'Matthew', mediaId: 'nj4ab0me7f' },
  { name: 'Rafa', mediaId: 'ps2vsxfiqz' },
  { name: 'Julian', mediaId: 'tll6v2b9vr' },
  { name: 'Carlos', mediaId: 'njeeh82o3b' },
];

function Step({ n, title, children }) {
  return (
    <section className="post-step">
      <p className="step-badge">
        Step {n} of {TOTAL_STEPS}
      </p>
      <h2 className="step-headline">{title}</h2>
      {children}
    </section>
  );
}

function GuideCard({ src, alt, caption, roomy = false }) {
  return (
    <figure className="guide-figure">
      <div className={`guide-card${roomy ? ' guide-card-roomy' : ''}`}>
        <img src={src} alt={alt} />
      </div>
      {caption ? <figcaption className="step-caption">{caption}</figcaption> : null}
    </figure>
  );
}

export default function PostBookingPage() {
  useEffect(() => {
    trackEvent(POST_BOOKING_VIEW, { page_id: 'post-booking' });

    const robots = document.querySelector('meta[name="robots"]');
    const previous = robots?.getAttribute('content') ?? '';
    if (robots) {
      robots.setAttribute('content', 'noindex, nofollow');
    } else {
      const tag = document.createElement('meta');
      tag.name = 'robots';
      tag.content = 'noindex, nofollow';
      document.head.appendChild(tag);
    }
    document.title = 'Complete These Steps | 4EverFitness';

    return () => {
      const tag = document.querySelector('meta[name="robots"]');
      if (tag && previous) tag.setAttribute('content', previous);
      else if (tag && !previous) tag.remove();
      document.title = '4EverFitness | PrimeShift';
    };
  }, []);

  return (
    <>
      <Header showHero={false} />
      <main className="page page-post">
        <section className="post-intro">
          <h1 className="page-title">You&apos;re almost there…</h1>
          <p className="mandatory">
            Complete these <strong>mandatory</strong> steps to lock in your strategy call.
          </p>
        </section>

        <section className="post-hero" aria-label="Post-booking video">
          <div className="post-hero-inner">
            <p className="post-hero-title">Watch this first</p>
            <p className="post-hero-cta">Tap play if it doesn&apos;t start on its own</p>
            <WistiaPlayer mediaId="7m8vunggxk" aspect={1.7777777777777777} autoplay />
          </div>
        </section>

        <Step n={1} title="Confirm your call">
          <p className="step-lead">
            You will receive a call or text message from{' '}
            <a className="confirm-phone" href={`tel:${CONFIRM_PHONE}`}>
              {CONFIRM_PHONE_LABEL}
            </a>{' '}
            within the <strong>next 24 hours</strong> to <strong>confirm your call</strong>.
          </p>
          <a className="guide-card phone-card" href={`tel:${CONFIRM_PHONE}`}>
            <span className="phone-card-label">Save this number</span>
            <span className="phone-card-number">{CONFIRM_PHONE_LABEL}</span>
            <span className="phone-card-hint">Call or text — tap to save</span>
          </a>
          <p className="step-caption step-caption-alert">
            If we cannot confirm your call, the call may be cancelled because availability is limited.
          </p>
        </Step>

        <Step n={2} title="Confirm your appointment in your calendar">
          <p className="step-lead">
            Open the calendar invite in your email and tap <strong>Yes</strong> to confirm your appointment.
          </p>
          <GuideCard
            src="/calendar_rsvp.webp"
            alt="Calendar invite with Yes, No, and Maybe RSVP buttons"
            caption='Tap "Yes" on your calendar invite to confirm.'
            roomy
          />
          <p className="step-lead">
            Your Google Meet link will be in the event description. Save it so you can join on call day.
          </p>
          <GuideCard
            src="/meeting_link.webp"
            alt="Google Meet location and join link in the calendar event details"
            caption="Find your Google Meet link in the event details."
            roomy
          />
        </Step>

        <Step n={3} title="Listen to common questions you may have">
          <p className="step-lead">Watch this before the call so the most common questions are already handled.</p>
          <div className="step-media">
            <WistiaPlayer mediaId="qcwdzwgy45" aspect={1.7777777777777777} />
          </div>
        </Step>

        <Step n={4} title="How our process works">
          <p className="step-lead">See how the 4EVERFIT system actually runs around a real work week.</p>
          <div className="step-media">
            <WistiaPlayer mediaId="tfha9wtyjy" aspect={1.5434083601286173} />
          </div>
        </Step>

        <Step n={5} title="See what our clients are saying">
          <p className="step-lead">Real clients. Watch a few of these before you show up.</p>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((item) => (
              <figure key={item.mediaId} className="testimonial-card">
                <figcaption className="testimonial-name">{item.name}</figcaption>
                <WistiaPlayer mediaId={item.mediaId} aspect={0.5625} />
              </figure>
            ))}
          </div>
        </Step>

        <section className="post-step bonus-block">
          <p className="step-badge">Bonus</p>
          <h2 className="step-headline">Watch my exclusive content to get an inside look at the 4EVERFIT Program</h2>
          <p className="step-lead">Tap the thumbnail to open the video in a new window.</p>
          <a className="exclusive-thumb" href={EXCLUSIVE_URL} target="_blank" rel="noopener noreferrer">
            <img src="/6a0a254b2e98e28fa16f6ca1.webp" alt="Exclusive 4EVERFIT Program transformation preview" />
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
