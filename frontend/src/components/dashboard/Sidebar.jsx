'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import * as Icons from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { usePathname, Link } from '@/i18n/routing';
import { NAV_GROUPS } from '@/lib/constants';
import { useUiStore } from '@/store/uiStore';
import { useBranding } from '@/hooks/useBranding';
import Tooltip from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

function NavIcon({ name, className }) {
  const Icon = Icons[name] || Icons.Circle;
  return <Icon className={className} />;
}

export default function Sidebar({ role = 'admin' }) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const { branding } = useBranding();
  const companyName = branding.companyName || 'Company';
  const logo = branding.logoDarkUrl || branding.logoUrl;

  const isActive = (href) =>
    pathname === href || (href !== '/dashboard/admin' && pathname.startsWith(href));

  // Visible groups for this role (group -> its allowed items).
  const groups = useMemo(
    () =>
      NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((it) => it.roles.includes(role)),
      })).filter((g) => g.items.length > 0),
    [role],
  );

  // Collapsible state — every group starts open.
  const [openGroups, setOpenGroups] = useState({});
  const isOpen = (key) => openGroups[key] !== false;
  const toggleGroup = (key) => setOpenGroups((s) => ({ ...s, [key]: s[key] === false }));

  const ItemLink = ({ item }) => {
    const link = (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
          isActive(item.href)
            ? 'bg-brand-blue text-white shadow-sm'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
          collapsed && 'w-full justify-center',
        )}
      >
        <NavIcon name={item.icon} className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{t(item.key)}</span>}
      </Link>
    );
    // When the rail is collapsed, surface the label as a hover/focus tooltip.
    if (collapsed) {
      return (
        <Tooltip content={t(item.key)} side="right" block>
          {link}
        </Tooltip>
      );
    }
    return link;
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-brand-navy/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-brand-navy text-white transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          collapsed ? 'w-[72px]' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-5">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={companyName} className="h-9 w-auto max-h-10 shrink-0 object-contain" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-amber font-display text-lg font-bold text-white">
              {companyName.charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && !logo && (
            <span className="truncate font-display text-lg font-bold tracking-tight">{companyName}</span>
          )}
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {collapsed
            ? // Icon rail: flat icons, no group headers
              groups.flatMap((g) => g.items).map((item) => <ItemLink key={item.key} item={item} />)
            : groups.map((g) => {
                // The "general" group has no header — render its items directly.
                if (g.key === 'general') {
                  return (
                    <div key={g.key} className="space-y-1">
                      {g.items.map((item) => (
                        <ItemLink key={item.key} item={item} />
                      ))}
                    </div>
                  );
                }
                const open = isOpen(g.key);
                return (
                  <div key={g.key} className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleGroup(g.key)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 transition hover:text-white/70"
                    >
                      <span>{t(g.key)}</span>
                      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open ? '' : '-rotate-90')} />
                    </button>
                    {open && (
                      <div className="mt-1 space-y-1">
                        {g.items.map((item) => (
                          <ItemLink key={item.key} item={item} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <div className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-white/50', collapsed && 'justify-center')}>
            <Icons.ShieldCheck className="h-4 w-4" />
            {!collapsed && <span>{tc('rbacNote')}</span>}
          </div>
        </div>
      </aside>
    </>
  );
}
