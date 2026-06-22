# Blackgaur — Web (Frontend)

Enterprise Transport Management System (TMS) frontend. Public marketing site + role-based
operations dashboard for trips, fleet, FASTag tolls, fuel cards, RCM/GST invoicing, reports
and audit logs. Built in **JavaScript + JSX** (no TypeScript).

## Stack

- **Next.js 14** (App Router, JavaScript)
- **Tailwind CSS v3** — brand design tokens (section 13)
- **next-intl** — i18n EN / HI / GU with locale-prefixed routing
- **Framer Motion** — micro-animations (section 11)
- **TanStack React Query** — server state
- **Zustand** — UI state (sidebar, modals, command palette, toasts)
- **React Hook Form + Zod** — forms
- **axios** — API client (envelope unwrap + 401 refresh)
- **Recharts** — charts
- **@tanstack/react-table v8** — data tables
- **lucide-react** — icons
- **canvas-confetti** — task-completion FX

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /en)
npm run build
npm run start
npm run lint
```

Optional env: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/v1`).
**The app runs standalone** — when the backend is unavailable every data hook falls back to
representative mock data (`src/lib/mock.js`), so all pages render and are demoable.

## Demo auth

There is no backend required. On `/login` enter any 10-digit number, pick a demo role, then
any 6-digit OTP on `/verify-otp`. An unsigned demo JWT is stored in the `accessToken` cookie
and `src/middleware.js` routes you to that role's dashboard home (section 3.4).

## Structure

```
src/
├── app/[locale]/
│   ├── (marketing)/      Home, about, services, track, pricing, contact
│   ├── (auth)/           login, verify-otp
│   └── dashboard/        admin (+ users, roles, audit-logs, translations),
│                         trips (Kanban), finance/{expenses,invoices},
│                         accounts/{clients,lr}, fastag, fuel, reports, driver
├── components/
│   ├── ui/               Shared library (section 15)
│   ├── marketing/        Public page sections
│   ├── dashboard/        Sidebar, Topbar, PageHeader, shell
│   ├── fastag/ fuel/     Module components
│   └── animations/       TaskCompleteFX
├── lib/                  animations, api, auth, gst, utils, constants, mock
├── hooks/                useTrips, useExpenses, useInvoices, useFastag,
│                         useFuelCards, useReports, useClients, useAuth, useCountUp
├── store/                uiStore, filterStore (Zustand)
├── i18n/                 routing.js, request.js
└── middleware.js         locale + JWT auth/role redirect
messages/                 en.json, hi.json, gu.json
```

## i18n notes

- Locales: `en`, `hi`, `gu`. URLs are always locale-prefixed (`/en/...`, `/hi/...`, `/gu/...`).
- Namespaces (section 9.2): `common, auth, dashboard, trips, expenses, invoices, fastag,
  fuel, roles, settings` plus `nav, users, rolesPage, audit, translations, clients, lr,
  reports, driver, marketing, footer`.
- All three message files share an identical key set (368 leaf keys).
- The `LanguageSwitcher` (navbar + dashboard topbar) swaps locale while preserving the path.
- Per-locale font: Inter (EN), Hind Vadodara (HI), Noto Sans Gujarati (GU) via `next/font`.

## Notes

- Permission checks in `src/lib/auth.js` are for **conditional UI rendering only** — the
  server enforces real RBAC on every request (section 2).
- GST/RCM math in `src/lib/gst.js` mirrors the server logic (section 8.3) for invoice preview;
  authoritative calculation is server-side.
- All animations respect `prefers-reduced-motion` (section 11.3, `globals.css`).
- `next/font` requests Hind Vadodara's `latin` subset (its Devanagari subset is not exposed by
  Google Fonts via `next/font`); swap to Noto Sans Devanagari if full Devanagari glyphs are needed.
