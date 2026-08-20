import { useEffect, useState } from 'react';
import Disqualified from '../components/Disqualified.jsx';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import Quiz from '../components/Quiz.jsx';
import ScrollingBanner from '../components/ScrollingBanner.jsx';
import ThankYou from '../components/ThankYou.jsx';
import { drainQueue, trackEvent } from '../lib/sweep';

const PAGE_VIEW = import.meta.env.VITE_EVT_PAGE_VIEW || 'quiz_page_view';

export default function LandingPage() {
  const [page, setPage] = useState('quiz');

  useEffect(() => {
    trackEvent(PAGE_VIEW, { page_id: 'intro', form_id: 'root-quiz' });
    void drainQueue();
  }, []);

  useEffect(() => {
    if (page !== 'quiz') window.scrollTo(0, 0);
  }, [page]);

  return (
    <>
      <Header showHero={page !== 'thankyou'} />
      <main className="page">
        {page === 'quiz' ? (
          <Quiz onQualified={() => setPage('thankyou')} onDisqualified={() => setPage('disqualified')} />
        ) : null}
        {page === 'thankyou' ? <ThankYou /> : null}
        {page === 'disqualified' ? <Disqualified /> : null}
      </main>
      {page === 'quiz' || page === 'thankyou' ? <ScrollingBanner /> : null}
      <Footer />
    </>
  );
}
