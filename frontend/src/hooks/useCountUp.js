'use client';

import { useEffect, useRef, useState } from 'react';

// Count-up animation from 0 -> value (section 11.2). Respects reduced motion.
export function useCountUp(value, duration = 800) {
  const [display, setDisplay] = useState(0);
  const frame = useRef();

  useEffect(() => {
    const target = Number(value) || 0;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(target);
      return undefined;
    }
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(target * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return display;
}
