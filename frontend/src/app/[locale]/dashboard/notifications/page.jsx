'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import * as Icons from 'lucide-react';
import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useRouter } from '@/i18n/routing';
import { useNotifStore } from '@/store/notifStore';
import { useNotifText } from '@/hooks/useNotifText';
import { NOTIF_TYPES, NOTIF_SEVERITY } from '@/lib/notifications';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const t = useTranslations('notificationsPage');
  const tc = useTranslations('common');
  const notifText = useNotifText();
  const router = useRouter();
  const notifs = useNotifStore((s) => s.notifications);
  const markRead = useNotifStore((s) => s.markRead);
  const markAllRead = useNotifStore((s) => s.markAllRead);

  const [filter, setFilter] = useState('all');
  const unread = notifs.filter((n) => !n.read).length;

  const filtered = useMemo(
    () => (filter === 'unread' ? notifs.filter((n) => !n.read) : notifs),
    [notifs, filter],
  );

  const open = (n) => {
    markRead(n.id);
    if (n.href) router.push(n.href);
  };

  const tabs = [
    { key: 'all', label: `${t('all')} (${notifs.length})` },
    { key: 'unread', label: `${t('unread')} (${unread})` },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        icon={Bell}
        accent="text-brand-blue"
        actions={
          unread > 0 && (
            <Button variant="outline" icon={CheckCheck} onClick={markAllRead}>
              {tc('markAllRead')}
            </Button>
          )
        }
      />

      <div className="mb-4 inline-flex rounded-xl border border-brand-border bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition',
              filter === tab.key ? 'bg-brand-blue text-white shadow-sm' : 'text-brand-muted hover:text-brand-navy',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={CheckCheck} title={t('empty')} subtitle={t('subtitle')} />
        </div>
      ) : (
        <div className="card divide-y divide-brand-border/70 overflow-hidden">
          {filtered.map((n) => {
            const meta = NOTIF_TYPES[n.type] || { icon: 'Bell', severity: 'info' };
            const sev = NOTIF_SEVERITY[meta.severity] || NOTIF_SEVERITY.info;
            const NIcon = Icons[meta.icon] || Icons.Bell;
            const text = notifText(n);
            return (
              <button
                key={n.id}
                onClick={() => open(n)}
                className={cn(
                  'flex w-full items-start gap-3.5 px-5 py-4 text-left transition hover:bg-brand-surface',
                  !n.read && 'bg-brand-blue/[0.04]',
                )}
              >
                <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', sev.chip)}>
                  <NIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-navy">{text.title}</span>
                    {meta.api && (
                      <span className="rounded bg-brand-fastag/10 px-1 text-[9px] font-semibold text-brand-fastag">API</span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-brand-muted">{text.message}</span>
                  <span className="mt-1 block text-xs text-brand-muted/80">{text.time}</span>
                </span>
                {!n.read && <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', sev.dot)} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
