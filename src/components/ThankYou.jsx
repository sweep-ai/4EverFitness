import { getDmKeyword, getInstagramHandle, getManyChatButtonHref, isInstagramInApp } from '../lib/instagram';

export default function ThankYou() {
  const href = getManyChatButtonHref();
  const keyword = getDmKeyword();
  const handle = getInstagramHandle();
  const inInstagram = isInstagramInApp();

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
      <a className="manychat-cta" href={href} target="_top" rel="noopener">
        Message me "<strong className="dm-keyword">{keyword}</strong>" to book 
      </a>
      <p className="qualify-hint">
        @{handle}
        {inInstagram ? ' · If the chat doesn’t open, DM that word from your inbox.' : ' · Limited slots — DMs are how we lock the call.'}
      </p>
    </section>
  );
}
