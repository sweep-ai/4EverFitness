import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MetaCapiTracker from './components/MetaCapiTracker.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const BookingPage = lazy(() => import('./pages/BookingPage.jsx'));
const PostBookingPage = lazy(() => import('./pages/PostBookingPage.jsx'));

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <MetaCapiTracker />
      <Suspense fallback={<div className="route-fallback">Loading…</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/post-booking" element={<PostBookingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
