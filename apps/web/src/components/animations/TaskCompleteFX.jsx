'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, useAnimationControls } from 'framer-motion';

// Wraps content and fires a completion FX on `trigger` change (section 11.1 / 15).
// types: approve | reject | delivered | paid | sent
export default function TaskCompleteFX({ type = 'approve', trigger, children, className }) {
  const controls = useAnimationControls();
  const wrapRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!trigger) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (type === 'approve' || type === 'paid' || type === 'delivered') {
      if (!reduce) {
        const rect = wrapRef.current?.getBoundingClientRect();
        const origin = rect
          ? {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight,
            }
          : { x: 0.5, y: 0.5 };
        confetti({
          particleCount: 12,
          spread: 55,
          startVelocity: 28,
          colors: ['#D97706', '#065F46'],
          origin,
          scalar: 0.8,
        });
      }
      controls.start({
        scale: [1, 1.12, 0.96, 1],
        transition: { duration: 0.4, times: [0, 0.3, 0.7, 1] },
      });
    } else if (type === 'reject') {
      controls.start({ x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.3 } });
    } else if (type === 'sent') {
      controls.start({
        y: [0, -6, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [trigger, type, controls]);

  return (
    <motion.div ref={wrapRef} animate={controls} className={className}>
      {children}
    </motion.div>
  );
}
