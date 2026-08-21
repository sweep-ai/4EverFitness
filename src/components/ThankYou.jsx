import { getApplicant } from '../lib/applicant';
import { getDmKeyword, getInstagramHandle, getManyChatButtonHref, isInstagramInApp } from '../lib/instagram';
import { generateEventId, sendCapi, trackPixel } from '../lib/meta';
import { getVisitorId } from '../lib/sweep';

export default function ThankYou() {
  const href = getManyChatButtonHref();
  const keyword = getDmKeyword();
  const handle = getInstagramHandle();
  const inInstagram = isInstagramInApp();

  async function handleManyChatClick(event) {
    event.preventDefault();
    const applicant = getApplicant() || {};
    const eventId = generateEventId('lead_manychat');
    const params = { content_name: 'ManyChat DM' };
    trackPixel('Lead', params, eventId);
    await sendCapi({
      eventName: 'Lead',
      eventId,
      visitor_id: getVisitorId(),
      email: applicant.email,
      phone: applicant.phone,
      first_name: applicant.first_name,
      last_name: applicant.last_name,
      customData: params,
    });
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.assign(href);
        return;
      }
    } catch {
      /* cross-origin frame */
    }
    window.location.assign(href);
  }

  return (
    <section className="qualify">
      <p className="qualify-kicker">Congrats qualified</p>
      <h1 className="qualify-title">You unlocked a free consultation call</h1>
      <p className="qualify-lead">
        A 1-on-1 strategy call to map a program around your actual day to day life.
      </p>
      <p className="qualify-action">
        {inInstagram ? (
          <>
            Tap below to shoot me a message on Instagram and book your slot. Send the word{' '}
            <strong className="dm-keyword">{keyword}</strong> so we know you came from the application.
          </>
        ) : (
          <>
            Press the button below to shoot me a message on Instagram and book your slot. Send the word{' '}
            <strong className="dm-keyword">{keyword}</strong>.
          </>
        )}
      </p>
      <a className="manychat-cta" href={href} target="_top" rel="noopener" onClick={handleManyChatClick}>
        Message me "<strong className="dm-keyword">{keyword}</strong>" to book 
      </a>
      <p className="qualify-hint">
        @{handle}
        {inInstagram ? ' · If the chat doesn’t open, DM that word from your inbox.' : ' · Limited slots — DMs are how we lock the call.'}
      </p>
    </section>
  );
}
