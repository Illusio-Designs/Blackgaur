'use client';

import { useEffect } from 'react';
import { useBranding } from '@/hooks/useBranding';
import { hexToRgbChannels } from '@/lib/color';

// Maps the buyer's theme (theme.sidebar/primary/accent) onto the brand CSS
// variables at runtime, so BOTH public pages and the dashboard re-theme live
// (section 13). SSR defaults in globals.css prevent any flash before mount.
function applyTheme(theme) {
  if (typeof document === 'undefined' || !theme) return;
  const root = document.documentElement;
  const map = {
    '--brand-navy': theme.sidebar,
    '--brand-blue': theme.primary,
    '--brand-amber': theme.accent,
  };
  Object.entries(map).forEach(([cssVar, hex]) => {
    const channels = hexToRgbChannels(hex);
    if (channels) root.style.setProperty(cssVar, channels);
  });
}

export default function ThemeProvider({ children }) {
  const { branding } = useBranding();
  const theme = branding?.theme;

  useEffect(() => {
    applyTheme(theme);
  }, [theme?.sidebar, theme?.primary, theme?.accent]); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}
