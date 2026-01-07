import { useState, useEffect, useRef } from 'react';

export function useTicker(): number {
  const [now, setNow] = useState(Date.now());
  const rafIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tickRaf = () => {
      setNow(Date.now());
      rafIdRef.current = requestAnimationFrame(tickRaf);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Resume rAF when tab becomes visible
        rafIdRef.current = requestAnimationFrame(tickRaf);
      } else {
        // Pause rAF when tab is hidden; fallback to coarse interval
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        // Use a 1-second interval for hidden tabs (accuracy still comes from timestamps)
        intervalIdRef.current = setInterval(() => {
          setNow(Date.now());
        }, 1000);
      }
    };

    // Start with rAF
    rafIdRef.current = requestAnimationFrame(tickRaf);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return now;
}
