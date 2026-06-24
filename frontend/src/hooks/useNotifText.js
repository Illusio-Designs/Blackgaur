'use client';

import { useTranslations } from 'next-intl';
import { timeAgo } from '@/lib/utils';

// Localizes a notification's title/message by its `type` (with `values`
// interpolated) and renders a locale-aware relative time from `minutesAgo`.
// Falls back to the English title/message baked into the mock if a key is
// missing. Shared by the topbar bell dropdown and the notifications page.
export function useNotifText() {
  const t = useTranslations('notificationsPage');
  return (n) => {
    const base = `types.${n.type}`;
    const title = t.has(`${base}.title`) ? t(`${base}.title`) : n.title;
    const message = t.has(`${base}.message`)
      ? t(`${base}.message`, n.values || {})
      : n.message;
    const time =
      n.minutesAgo != null ? timeAgo(Date.now() - n.minutesAgo * 60000) : n.time;
    return { title, message, time };
  };
}
