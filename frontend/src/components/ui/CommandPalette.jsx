'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Truck, Building2, FileText, Box, CornerDownLeft } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useUiStore } from '@/store/uiStore';
import { overlayFade, modalScaleIn } from '@/lib/animations';
import { useTrips } from '@/hooks/useTrips';
import { useClients } from '@/hooks/useClients';
import { useVehicles } from '@/hooks/useVehicles';
import { useInvoices } from '@/hooks/useInvoices';
import { cn } from '@/lib/utils';

const GROUP_ICONS = {
  Trips: Truck,
  Clients: Building2,
  Vehicles: Box,
  Invoices: FileText,
};

function buildItems({ trips, clients, vehicles, invoices }) {
  return [
    ...trips.map((t) => ({
      id: `trip-${t.id}`,
      label: t.lr_number,
      sub: `${t.origin_city} → ${t.destination_city}`,
      group: 'Trips',
      href: `/dashboard/trips?trip=${t.id}`,
    })),
    ...clients.map((c) => ({
      id: `client-${c.id}`,
      label: c.company_name,
      sub: c.gstin,
      group: 'Clients',
      href: `/dashboard/accounts/clients?client=${c.id}`,
    })),
    ...vehicles.map((v) => ({
      id: `vehicle-${v.id}`,
      label: v.registration_no,
      sub: v.model,
      group: 'Vehicles',
      href: `/dashboard/trips?vehicle=${v.id}`,
    })),
    ...invoices.map((iv) => ({
      id: `invoice-${iv.id}`,
      label: iv.invoice_number,
      sub: iv.client?.company_name,
      group: 'Invoices',
      href: `/dashboard/finance/invoices?invoice=${iv.id}`,
    })),
  ];
}

export default function CommandPalette() {
  const tc = useTranslations('common');
  const router = useRouter();
  const open = useUiStore((s) => s.commandPaletteOpen);
  const closePalette = useUiStore((s) => s.closeCommandPalette);
  const toggle = useUiStore((s) => s.toggleCommandPalette);

  const tripsData = useTrips().data;
  const clientsData = useClients().data;
  const vehiclesData = useVehicles().data;
  const invoicesData = useInvoices().data;
  const trips = useMemo(() => tripsData?.data ?? [], [tripsData]);
  const clients = useMemo(() => clientsData?.data ?? [], [clientsData]);
  const vehicles = useMemo(() => vehiclesData?.data ?? [], [vehiclesData]);
  const invoices = useMemo(() => invoicesData?.data ?? [], [invoicesData]);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const allItems = useMemo(
    () => buildItems({ trips, clients, vehicles, invoices }),
    [trips, clients, vehicles, invoices],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.group.toLowerCase().includes(q) ||
        (i.sub && i.sub.toLowerCase().includes(q)),
    );
  }, [query, allItems]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((i) => {
      (map[i.group] = map[i.group] || []).push(i);
    });
    return map;
  }, [filtered]);

  // Global Cmd+K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const select = (item) => {
    if (!item) return;
    closePalette();
    router.push(item.href);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(filtered[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  };

  // Keep active item in view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (typeof document === 'undefined') return null;

  let flatIndex = -1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            {...overlayFade}
            className="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm"
            onClick={closePalette}
          />
          <motion.div
            {...modalScaleIn}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-elevated"
          >
            <div className="flex items-center gap-3 border-b border-brand-border px-4">
              <Search className="h-4 w-4 shrink-0 text-brand-muted" />
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={tc('commandSearch')}
                className="h-12 w-full border-0 bg-transparent text-sm text-brand-navy outline-none ring-0 placeholder:text-brand-muted focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <kbd className="hidden rounded border border-brand-border bg-brand-surface px-1.5 py-0.5 text-[10px] font-medium text-brand-muted sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="scrollbar-thin max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-brand-muted">{tc('noResults')}</p>
              ) : (
                Object.entries(grouped).map(([group, items]) => {
                  const GroupIcon = GROUP_ICONS[group] || Box;
                  return (
                    <div key={group} className="mb-1">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                        {group}
                      </p>
                      {items.map((item) => {
                        flatIndex += 1;
                        const idx = flatIndex;
                        const isActive = idx === active;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-active={isActive}
                            onMouseEnter={() => setActive(idx)}
                            onClick={() => select(item)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition',
                              isActive ? 'bg-brand-blue/10' : 'hover:bg-brand-surface',
                            )}
                          >
                            <GroupIcon className="h-4 w-4 shrink-0 text-brand-muted" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-brand-navy">{item.label}</span>
                              {item.sub && <span className="block truncate text-xs text-brand-muted">{item.sub}</span>}
                            </span>
                            {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand-blue" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-brand-border bg-brand-surface/50 px-4 py-2.5 text-[11px] text-brand-muted">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono">↑</kbd>
                  <kbd className="rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono">↓</kbd>
                  {tc('kbdNavigate')}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono">↵</kbd>
                  {tc('kbdOpen')}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono">esc</kbd>
                {tc('kbdClose')}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
