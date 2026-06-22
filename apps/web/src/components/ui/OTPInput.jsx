'use client';

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// 6-cell OTP input: auto-advance, paste, backspace nav (section 15).
export default function OTPInput({ length = 6, onComplete, onChange, autoFocus = true }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const emit = (next) => {
    const code = next.join('');
    onChange?.(code);
    if (code.length === length && !next.includes('')) onComplete?.(code);
  };

  const handleChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...values];
    next[i] = digit;
    setValues(next);
    emit(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill('');
    pasted.split('').forEach((d, idx) => (next[idx] = d));
    setValues(next);
    emit(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            'h-12 w-11 rounded-xl border border-brand-border bg-white text-center font-mono text-xl font-semibold text-brand-navy transition focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 sm:h-14 sm:w-12',
            v && 'border-brand-blue/60 bg-brand-blue/5',
          )}
        />
      ))}
    </div>
  );
}
