// src/components/Analytics.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ENDPOINT = 'https://chelqujdhnjboeeamxtu.supabase.co/functions/v1/track-pageview';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  let id = localStorage.getItem('_vid');
  if (!id) {
    id = generateId();
    localStorage.setItem('_vid', id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem('_sid');
  if (!id) {
    id = generateId();
    sessionStorage.setItem('_sid', id);
  }
  return id;
}

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostname: window.location.hostname,
            path: location.pathname,
            pageTitle: document.title,
            referrer: document.referrer,
            visitorId: getVisitorId(),
            sessionId: getSessionId(),
          }),
        });
      } catch (err) {
        console.log('Analytics error:', err);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null;
}

export default Analytics;