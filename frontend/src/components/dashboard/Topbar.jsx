'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, Bell, Search, LogOut, User, Settings, ChevronDown, PanelLeftClose, CheckCheck } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, Link } from '@/i18n/routing';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/constants';
import { initials, cn } from '@/lib/utils';
import { NOTIF_TYPES, NOTIF_SEVERITY } from '@/lib/notifications';
import { useNotifStore } from '@/store/notifStore';
import { useNotifText } from '@/hooks/useNotifText';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import Tooltip from '@/components/ui/Tooltip';

export default function Topbar() {
  const t = useTranslations('common');
  const tr = useTranslations('roles');
  const router = useRouter();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleCollapsed = useUiStore((s) => s.toggleCollapsed);
  const toggleCommandPalette = useUiStore((s) => s.toggleCommandPalette);
  const { user, logout } = useAuth();

  const notifs = useNotifStore((s) => s.notifications);
  const markRead = useNotifStore((s) => s.markRead);
  const markAllRead = useNotifStore((s) => s.markAllRead);
  const notifText = useNotifText();
  const unread = notifs.filter((n) => !n.read).length;
  const openNotif = (n) => {
    markRead(n.id);
    setNotifOpen(false);
    if (n.href) router.push(n.href);
  };

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const roleLabel = user?.role && tr.has(user.role) ? tr(user.role) : (ROLES.find((r) => r.value === user?.role)?.label || 'User');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-brand-border bg-white/90 px-4 backdrop-blur lg:px-6">
      <button
        onClick={toggleSidebar}
        className="btn-focus rounded-lg p-2 text-brand-muted hover:bg-brand-surface lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Tooltip content={t('collapseSidebar')} side="bottom" className="hidden lg:inline-flex">
        <button
          onClick={toggleCollapsed}
          className="btn-focus rounded-lg p-2 text-brand-muted hover:bg-brand-surface"
          aria-label={t('collapseSidebar')}
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </Tooltip>

      <button
        onClick={toggleCommandPalette}
        className="btn-focus group hidden items-center gap-2 rounded-xl border border-brand-border bg-brand-surface/60 px-3 py-2 text-sm text-brand-muted transition hover:bg-brand-surface sm:flex"
      >
        <Search className="h-4 w-4" />
        <span>{t('search')}…</span>
        <kbd className="ml-2 rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono text-[10px] text-brand-muted">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher compact />

        <div ref={notifRef} className="relative">
          <Tooltip content={t('notifications')} side="bottom">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="btn-focus relative rounded-lg p-2 text-brand-muted hover:bg-brand-surface"
            aria-label={t('notifications')}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-amber text-[10px] font-bold text-white"
              >
                {unread}
              </motion.span>
            )}
          </button>
          </Tooltip>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 mt-2 w-[360px] max-w-[92vw] overflow-hidden rounded-xl border border-brand-border bg-white shadow-elevated"
              >
                <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
                  <span className="font-semibold text-brand-navy">{t('notifications')}</span>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> {t('markAllRead')}
                    </button>
                  )}
                </div>
                <div className="scrollbar-thin max-h-[420px] divide-y divide-brand-border/60 overflow-y-auto">
                  {notifs.map((n) => {
                    const meta = NOTIF_TYPES[n.type] || { icon: 'Bell', severity: 'info' };
                    const sev = NOTIF_SEVERITY[meta.severity] || NOTIF_SEVERITY.info;
                    const NIcon = Icons[meta.icon] || Icons.Bell;
                    const text = notifText(n);
                    return (
                      <button
                        key={n.id}
                        onClick={() => openNotif(n)}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-brand-surface',
                          !n.read && 'bg-brand-blue/[0.04]',
                        )}
                      >
                        <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', sev.chip)}>
                          <NIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-brand-navy">{text.title}</span>
                            {meta.api && <span className="rounded bg-brand-fastag/10 px-1 text-[9px] font-semibold text-brand-fastag">API</span>}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-brand-muted">{text.message}</span>
                          <span className="mt-1 block text-[11px] text-brand-muted/80">{text.time}</span>
                        </span>
                        {!n.read && <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', sev.dot)} />}
                      </button>
                    );
                  })}
                </div>
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="block border-t border-brand-border px-4 py-2.5 text-center text-sm font-medium text-brand-blue hover:bg-brand-surface"
                >
                  {t('viewAll')}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="btn-focus flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-brand-surface"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
              {initials(user?.name || 'Demo User')}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-brand-navy">
                {user?.name || 'Demo User'}
              </span>
              <span className="block text-xs leading-tight text-brand-muted">{roleLabel}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-brand-muted sm:block" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-brand-border bg-white py-1 shadow-elevated"
              >
                <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-surface">
                  <User className="h-4 w-4 text-brand-muted" /> {t('profile')}
                </button>
                <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-surface">
                  <Settings className="h-4 w-4 text-brand-muted" /> {t('settings')}
                </button>
                <div className="my-1 border-t border-brand-border" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-brand-danger hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> {t('logout')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
