import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendlyEmbed from '../components/CalendlyEmbed.jsx';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import ScrollingBanner from '../components/ScrollingBanner.jsx';
import { getApplicant } from '../lib/applicant';
import { dualFire, getLeadEventId, setScheduleEventId } from '../lib/meta';
import { getSessionId, getVisitorId, trackEvent } from '../lib/sweep';

const BOOKING_VIEW = import.meta.env.VITE_EVT_BOOKING_VIEW || 'booking_page_view';
const SCHEDULE_EVENT = import.meta.env.VITE_EVT_SCHEDULE || 'call_scheduled';

export default function BookingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent(BOOKING_VIEW, { page_id: 'booking' });
    const applicant = getApplicant();
    const leadEventId = getLeadEventId();
    if (leadEventId) {
      dualFire('Lead', {
        eventId: leadEventId,
        visitor_id: getVisitorId(),
        email: applicant?.email,
        phone: applicant?.phone,
        first_name: applicant?.first_name,
        last_name: applicant?.last_name,
        pixelParams: { content_name: 'PrimeShift booking' },
        customData: { content_name: 'PrimeShift booking' },
      });
    }
  }, []);

  const handleScheduled = useCallback(() => {
    const sessionId = getSessionId();
    const applicant = getApplicant();
    const scheduleEventId = setScheduleEventId();
    trackEvent(SCHEDULE_EVENT, { page_id: 'booking' }, `${SCHEDULE_EVENT}_${sessionId}`);
    dualFire('Schedule', {
      eventId: scheduleEventId,
      visitor_id: getVisitorId(),
      email: applicant?.email,
      phone: applicant?.phone,
      first_name: applicant?.first_name,
      last_name: applicant?.last_name,
      pixelParams: { content_name: 'Strategy call booked' },
      customData: { content_name: 'Strategy call booked' },
    });
    navigate('/post-booking', { replace: true });
  }, [navigate]);

  return (
    <>
      <Header showHero={false} />
      <main className="page page-wide">
        <section className="booking-intro">
          <p className="kicker">You qualified</p>
          <h1 className="page-title">Book your 1-on-1 strategy call</h1>
          <p className="page-lead">
            Pick a time that works. This call is where we map a system around your actual schedule — not a
            generic plan you already know won&apos;t stick.
          </p>
        </section>
        <CalendlyEmbed onScheduled={handleScheduled} />
      </main>
      <ScrollingBanner />
      <Footer />
    </>
  );
}
