import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getApplicant } from '../lib/applicant';
import { dualFire, generateEventId } from '../lib/meta';
import { getVisitorId } from '../lib/sweep';

export default function MetaCapiTracker() {
  const { pathname } = useLocation();
  const lastPath = useRef('');

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const applicant = getApplicant();
    const initialId =
      pathname === '/' && typeof window !== 'undefined' ? window.__META_PV_ID : '';
    if (typeof window !== 'undefined' && initialId) window.__META_PV_ID = undefined;

    dualFire('PageView', {
      eventId: initialId || generateEventId('pv'),
      skipPixel: Boolean(initialId),
      visitor_id: getVisitorId(),
      email: applicant?.email,
      phone: applicant?.phone,
      first_name: applicant?.first_name,
      last_name: applicant?.last_name,
    });
  }, [pathname]);

  return null;
}
