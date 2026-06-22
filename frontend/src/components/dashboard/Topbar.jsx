'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, Bell, Search, LogOut, User, Settings, ChevronDown, PanelLeftClose } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n/routing';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/constants';
import { initials } from '@/lib/utils';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const MOCK_NOTIFS = [
  { id: 1, type: 'fastag', text: 'GJ-12-EF-9012 low FASTag balance (₹89)' },
  { id: 2, type: 'expense', text: '4 expenses awaiting approval' },
  { id: 3, type: 'invoice', text: 'INV-2024-25-0004 is overdue' },
];

export default function Topbar() {
  const t = useTranslations('common');
  const router = useRouter();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleCollapsed = useUiStore((s) => s.toggleCollapsed);
  const toggleCommandPalette = useUiStore((s) => s.toggleCommandPalette);
  const { user, logout } = useAuth();

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

  const roleLabel = ROLES.find((r) => r.value === user?.role)?.label || 'User';

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
      <button
        onClick={toggleCollapsed}
        className="btn-focus hidden rounded-lg p-2 text-brand-muted hover:bg-brand-surface lg:block"
        aria-label="Collapse sidebar"
      >
        <PanelLeftClose className="h-5 w-5" />
      </button>

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
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="btn-focus relative rounded-lg p-2 text-brand-muted hover:bg-brand-surface"
            aria-label={t('notifications')}
          >
            <Bell className="h-5 w-5" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-amber text-[10px] font-bold text-white"
            >
              {MOCK_NOTIFS.length}
            </motion.span>
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-brand-border bg-white shadow-elevated"
              >
                <div className="border-b border-brand-border px-4 py-3 font-semibold text-brand-navy">
                  {t('notifications')}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {MOCK_NOTIFS.map((n) => (
                    <div
                      key={n.id}
                      className="border-b border-brand-border/60 px-4 py-3 text-sm text-brand-text last:border-0 hover:bg-brand-surface"
                    >
                      {n.text}
                    </div>
                  ))}
                </div>
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
