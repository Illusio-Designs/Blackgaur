# Blackgaur — Transport Management System (TMS)

Enterprise-grade SaaS platform for a transport business. Covers the full
operations lifecycle: trip planning, driver assignment, fleet management,
real-time FASTag toll tracking, fuel card expense management, GST/RCM invoicing,
and financial reporting — in one dashboard with role-based access for every team
member, in **English, Hindi, and Gujarati**.

> Built to the **TMS Full-Stack Technical Architecture v3.0** specification
> (`TMS_ARCHITECTURE_v3.txt`).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v3 |
| Backend | Node.js + Express, TypeScript |
| Database | MySQL 8 via Prisma ORM |
| Auth | JWT (access + refresh) + MSG91 OTP |
| i18n | next-intl — EN / HI / GU |
| Animation | Framer Motion + GSAP |
| Integrations | FASTag (IHMCL/NETC), Fuel Cards (HPCL/IOCL/BPCL), AWS S3, Redis |

## Monorepo Layout

```
blackgaur-tms/
├── apps/
│   ├── api/   → Node.js + Express + Prisma REST API (v1)
│   └── web/   → Next.js 14 dashboard + public marketing site
├── package.json   → npm workspaces root
└── TMS_ARCHITECTURE_v3.txt → source architecture spec
```

## Getting Started

```bash
# 1. Install (root workspaces)
npm install

# 2. Configure environment
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local   # only NEXT_PUBLIC_* are used

# 3. Database — generate client, push schema, seed roles + admin
npm run prisma:generate
npm run prisma:migrate
npm run seed

# 4. Run both apps (api:4000, web:3000)
npm run dev
```

## Roles

`admin` · `trip_manager` · `finance_manager` · `account_manager` · `driver`

All permission enforcement is **server-side** via the `hasPermission(resource,
action, scope)` middleware. The client only conditionally renders UI.

## Core Modules

Trips · Drivers · Vehicles · FASTag Manager · Fuel Card Manager · Expenses ·
Invoices & RCM/GST Billing · Reports & Analytics · Audit Logs · i18n.

See [`apps/api/README.md`](apps/api/README.md) and
[`apps/web/README.md`](apps/web/README.md) for module-level documentation.
