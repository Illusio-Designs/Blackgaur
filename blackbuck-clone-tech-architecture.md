# BlackBuck-Style Trucking Super-App — Technical Architecture & Scale Blueprint

> **Goal:** Build a BlackBuck-equivalent platform — FASTag, GPS, Loads Marketplace, Fuel Cards, Vehicle Loans — for the Indian trucking ecosystem.
> **Stack (latest, April 2026):** Node.js 22 LTS · Next.js 15 (App Router, React 19) · MySQL 8.4 LTS · TypeScript 5.x · Redis 7 · Kafka 3.7 · React Native 0.76 (drivers app) · AWS (ap-south-1).
> **Audience:** Engineering, DevOps, Product. This is the implementation + scaling blueprint.

---

## Table of Contents

1. [Tech Stack — Final Picks](#1-tech-stack--final-picks)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Domain & Service Decomposition](#3-domain--service-decomposition)
4. [Repository Layout (Monorepo)](#4-repository-layout-monorepo)
5. [MySQL Database Design](#5-mysql-database-design)
6. [API Design](#6-api-design)
7. [Frontend (Next.js 15) Architecture](#7-frontend-nextjs-15-architecture)
8. [Driver Mobile App (React Native)](#8-driver-mobile-app-react-native)
9. [Real-Time / Telematics Pipeline (GPS)](#9-real-time--telematics-pipeline-gps)
10. [Payments, Wallet, FASTag, Fuel Card](#10-payments-wallet-fastag-fuel-card)
11. [Loans & Underwriting Service](#11-loans--underwriting-service)
12. [Loads Marketplace](#12-loads-marketplace)
13. [Auth, KYC, RBAC](#13-auth-kyc-rbac)
14. [Infrastructure & DevOps](#14-infrastructure--devops)
15. [Scalability Plan (0 → 10M users)](#15-scalability-plan-0--10m-users)
16. [Observability, SRE, SLOs](#16-observability-sre-slos)
17. [Security & Compliance](#17-security--compliance)
18. [Phased Delivery Roadmap](#18-phased-delivery-roadmap)
19. [Cost Model (Indicative)](#19-cost-model-indicative)
20. [Risks & Mitigations](#20-risks--mitigations)

---

## 1. Tech Stack — Final Picks

| Layer | Choice | Why |
|---|---|---|
| Backend runtime | **Node.js 22 LTS** | LTS until Apr 2027, native fetch, stable test runner, built-in WebSocket client. |
| Backend framework | **NestJS 10** (TypeScript) | Modular, DI, decorators, plays well with microservices and OpenAPI. Alternative: **Fastify 5** for ultra-light services. |
| Web frontend | **Next.js 15 (App Router) + React 19** | Server Components, Server Actions, partial pre-rendering, Turbopack stable. |
| ORM | **Prisma 5** (primary) or **Drizzle ORM** | Prisma for app teams, Drizzle for high-throughput services. |
| Database | **MySQL 8.4 LTS** | Window functions, CTEs, JSON columns, instant ADD COLUMN. |
| Cache / pub-sub | **Redis 7** (ElastiCache) | Sessions, rate-limit, hot reads, pub/sub for live updates. |
| Queue / events | **Kafka 3.7** (MSK) + **BullMQ** | Kafka = domain events; BullMQ = job queues (delayed, retry). |
| Search | **OpenSearch 2.x** | Loads marketplace search, full-text. |
| Object storage | **AWS S3** | Documents (KYC, RC, driving licence, invoices). |
| Realtime | **MQTT (EMQX)** for GPS · **WebSocket (Socket.IO)** for app | MQTT scales to 100K+ devices per broker; WS for in-app live data. |
| Mobile (drivers) | **React Native 0.76 + Expo** | Android-first, code reuse with web team. |
| Auth | **OAuth2 / OIDC + JWT (RS256)** + **OTP (SMS/WhatsApp)** | India = phone-first; passwords are friction. |
| Container / orchestration | **Docker** + **Kubernetes (EKS)** | Standard. ECS Fargate is acceptable for MVP. |
| API gateway | **Kong** or **AWS API Gateway** | Rate limit, auth, routing. |
| Observability | **OpenTelemetry → Grafana / Tempo / Loki / Mimir** | Vendor-neutral, single pane of glass. |
| CI/CD | **GitHub Actions + Argo CD** (GitOps) | Standard, auditable. |
| IaC | **Terraform** | Multi-account AWS. |
| Package mgr / monorepo | **pnpm + Turborepo** | Fast installs, incremental builds. |

---

## 2. High-Level Architecture

```
                    ┌────────────────────────────────────────────┐
                    │            CDN (CloudFront)                │
                    └──────────────────┬─────────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
        ┌───────▼────────┐   ┌─────────▼────────┐   ┌─────────▼─────────┐
        │  Next.js Web   │   │ Driver App (RN)  │   │ Shipper Web (Next)│
        │  (SSR + RSC)   │   │   Android/iOS    │   │   (B2B portal)    │
        └───────┬────────┘   └─────────┬────────┘   └─────────┬─────────┘
                │                      │                      │
                └──────────────────────┴──────────────────────┘
                                       │ HTTPS / WSS / MQTTS
                                       ▼
                          ┌────────────────────────┐
                          │   API Gateway (Kong)   │
                          │  authn · rate-limit    │
                          └───────────┬────────────┘
                                      │
       ┌──────────────┬───────────────┼───────────────┬──────────────┐
       ▼              ▼               ▼               ▼              ▼
 ┌──────────┐  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐
 │  Auth /  │  │   Loads      │ │  Telematics  │ │  Payments  │ │  Loans   │
 │  Users   │  │  Marketplace │ │   (MQTT in)  │ │ (Wallet,   │ │ (Under-  │
 │          │  │              │ │              │ │  FASTag,   │ │  writing │
 │          │  │              │ │              │ │  Fuel)     │ │  + NBFC) │
 └────┬─────┘  └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ └────┬─────┘
      │               │                │               │             │
      └───────────────┴────────┬───────┴───────────────┴─────────────┘
                               ▼
                  ┌─────────────────────────┐
                  │     Kafka Event Bus     │
                  │  (domain events + CDC)  │
                  └────────────┬────────────┘
                               ▼
              ┌────────────────┬─────────────────┬────────────────┐
              ▼                ▼                 ▼                ▼
        ┌──────────┐    ┌────────────┐   ┌─────────────┐   ┌────────────┐
        │  MySQL   │    │   Redis    │   │ OpenSearch  │   │     S3     │
        │  8.4     │    │  Cache /   │   │  (Loads,    │   │ Documents/ │
        │ (sharded │    │  Sessions  │   │   Search)   │   │  Receipts  │
        │  by user)│    │            │   │             │   │            │
        └──────────┘    └────────────┘   └─────────────┘   └────────────┘
```

**Architecture style:** Start as a **modular monolith** with clear domain boundaries (single deployable, multiple Nest modules). **Carve out** services as load demands — Telematics first (highest write volume), then Payments (compliance + isolation), then Loans (regulatory).

> Don't start with 12 microservices. Start with one well-modularized backend; extract services only when a real scaling or compliance constraint forces it.

---

## 3. Domain & Service Decomposition

| Bounded Context | Responsibility | Sync APIs | Async Events Emitted |
|---|---|---|---|
| **Identity** | Phone OTP, KYC, profile, RBAC | `/auth/*`, `/users/*` | `UserVerified`, `KycApproved` |
| **Vehicles** | RC, fitness, permits, ownership | `/vehicles/*` | `VehicleAdded`, `RcExpiring` |
| **Telematics (GPS)** | Live location, trips, geofence, theft alerts | `/devices/*`, `/trips/*` | `LocationPing`, `IgnitionOn`, `TheftSuspected` |
| **Loads Marketplace** | Load posting, search, bidding, booking | `/loads/*`, `/bids/*` | `LoadPosted`, `BidPlaced`, `LoadBooked` |
| **Wallet & Payments** | Wallet balance, top-ups, P2P, payouts | `/wallet/*`, `/payments/*` | `WalletCredited`, `PayoutInitiated` |
| **FASTag** | Issuance, recharge, toll txn ingest | `/fastag/*` | `TagIssued`, `TollDebit` |
| **Fuel Card** | Card issuance, swipes, rewards | `/fuel/*` | `CardSwipe`, `RewardEarned` |
| **Loans** | Eligibility, application, disbursal, EMI | `/loans/*` | `LoanApproved`, `EmiDue`, `EmiPaid` |
| **Insurance** | Driver/helper/vehicle policies | `/insurance/*` | `PolicyIssued`, `ClaimRaised` |
| **Used Trucks** | Listings, inspection reports, deals | `/used-trucks/*` | `TruckListed`, `DealClosed` |
| **Notifications** | SMS, WhatsApp, push, email | internal RPC | — |
| **Admin / Ops Console** | Internal CRM, support, dispute resolution | `/admin/*` | — |

**Communication rules:**
- **Sync**: REST/JSON between gateway ↔ service. Internal service-to-service via gRPC (optional) or REST.
- **Async**: Kafka topics, schema-registered (Avro / Protobuf). Every state change publishes a domain event.

---

## 4. Repository Layout (Monorepo)

Use **Turborepo + pnpm workspaces**.

```
blackbuck-clone/
├── apps/
│   ├── web-shipper/          # Next.js 15 — shippers + admin
│   ├── web-driver/           # Next.js 15 — driver/owner web
│   ├── mobile-driver/        # React Native — drivers
│   ├── api-gateway/          # Kong config / Express edge (light)
│   └── admin-console/        # Next.js 15 — internal ops
├── services/
│   ├── identity/
│   ├── vehicles/
│   ├── loads/
│   ├── telematics/
│   ├── wallet/
│   ├── fastag/
│   ├── fuel/
│   ├── loans/
│   ├── insurance/
│   └── notifications/
├── packages/
│   ├── ui/                   # shadcn/ui + Tailwind 4 design system
│   ├── config-eslint/
│   ├── config-tsconfig/
│   ├── sdk-client/           # generated OpenAPI client
│   ├── domain-events/        # Avro/Proto schemas
│   ├── db-prisma/            # shared Prisma client + migrations
│   └── utils/
├── infra/
│   ├── terraform/
│   └── k8s/                  # Helm charts, Argo apps
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 5. MySQL Database Design

### 5.1 Per-service ownership (one DB per service in production)

- `identity_db`, `vehicles_db`, `loads_db`, `telematics_db`, `wallet_db`, `fastag_db`, `fuel_db`, `loans_db`, `notifications_db`, `audit_db`.
- Cross-service joins are **forbidden**. Use events + read-model projections (CQRS-lite) for cross-domain queries.

### 5.2 Conventions

- Charset: `utf8mb4` / collation `utf8mb4_0900_ai_ci`.
- IDs: **ULID** (`CHAR(26)`) — sortable, no central counter, shardable.
- Timestamps: `created_at`, `updated_at` `DATETIME(3)` UTC; soft-delete via `deleted_at`.
- Money: `DECIMAL(18,4)` paise-level precision, never floats.
- All FKs declared (even when cross-service is inferred).
- JSON columns only for truly variable shapes (e.g., `metadata`).

### 5.3 Core tables (sample)

```sql
-- identity_db.users
CREATE TABLE users (
  id              CHAR(26)       PRIMARY KEY,
  phone_e164      VARCHAR(16)    NOT NULL UNIQUE,
  full_name       VARCHAR(120),
  role            ENUM('OWNER','DRIVER','SHIPPER','BROKER','ADMIN') NOT NULL,
  kyc_status      ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  language        CHAR(5)        DEFAULT 'en-IN',
  created_at      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                  ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at      DATETIME(3)    NULL,
  INDEX idx_role_created (role, created_at)
) ENGINE=InnoDB;

-- vehicles_db.vehicles
CREATE TABLE vehicles (
  id              CHAR(26)       PRIMARY KEY,
  owner_user_id   CHAR(26)       NOT NULL,
  registration_no VARCHAR(20)    NOT NULL UNIQUE,
  rc_number       VARCHAR(40),
  make_model      VARCHAR(80),
  capacity_tons   DECIMAL(6,2),
  fuel_type       ENUM('DIESEL','PETROL','CNG','EV','LNG'),
  permit_state    VARCHAR(2),
  fitness_expiry  DATE,
  created_at      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_owner (owner_user_id)
) ENGINE=InnoDB;

-- loads_db.loads
CREATE TABLE loads (
  id               CHAR(26)      PRIMARY KEY,
  shipper_user_id  CHAR(26)      NOT NULL,
  origin_lat       DECIMAL(9,6)  NOT NULL,
  origin_lng       DECIMAL(9,6)  NOT NULL,
  origin_pincode   CHAR(6)       NOT NULL,
  dest_lat         DECIMAL(9,6)  NOT NULL,
  dest_lng         DECIMAL(9,6)  NOT NULL,
  dest_pincode     CHAR(6)       NOT NULL,
  cargo_type       VARCHAR(60),
  weight_tons      DECIMAL(6,2),
  pickup_at        DATETIME(3),
  expected_price   DECIMAL(18,4),
  status           ENUM('OPEN','BOOKED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'OPEN',
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_status_pickup (status, pickup_at),
  INDEX idx_origin_pin    (origin_pincode, status),
  INDEX idx_dest_pin      (dest_pincode, status)
) ENGINE=InnoDB;

-- wallet_db.wallets
CREATE TABLE wallets (
  id            CHAR(26)     PRIMARY KEY,
  user_id       CHAR(26)     NOT NULL UNIQUE,
  balance_paise BIGINT       NOT NULL DEFAULT 0,
  hold_paise    BIGINT       NOT NULL DEFAULT 0,
  version       BIGINT       NOT NULL DEFAULT 0,  -- optimistic locking
  updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                              ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

-- wallet_db.ledger (append-only, double-entry)
CREATE TABLE ledger_entries (
  id              CHAR(26)     PRIMARY KEY,
  txn_id          CHAR(26)     NOT NULL,
  wallet_id       CHAR(26)     NOT NULL,
  direction       ENUM('DEBIT','CREDIT') NOT NULL,
  amount_paise    BIGINT       NOT NULL,
  balance_after   BIGINT       NOT NULL,
  reason_code     VARCHAR(40)  NOT NULL,
  ref_type        VARCHAR(40),
  ref_id          CHAR(26),
  created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_wallet_created (wallet_id, created_at),
  INDEX idx_txn (txn_id)
) ENGINE=InnoDB;

-- telematics_db.location_pings  (HOT, partitioned, short retention)
CREATE TABLE location_pings (
  device_id   CHAR(26)     NOT NULL,
  ts          DATETIME(3)  NOT NULL,
  lat         DECIMAL(9,6) NOT NULL,
  lng         DECIMAL(9,6) NOT NULL,
  speed_kmph  SMALLINT,
  ignition    TINYINT(1),
  battery_pct TINYINT,
  PRIMARY KEY (device_id, ts)
) ENGINE=InnoDB
  PARTITION BY RANGE (TO_DAYS(ts)) (
    PARTITION p_2026_04 VALUES LESS THAN (TO_DAYS('2026-05-01')),
    PARTITION p_2026_05 VALUES LESS THAN (TO_DAYS('2026-06-01')),
    PARTITION p_max     VALUES LESS THAN (MAXVALUE)
);
```

> **GPS volume note:** 1M devices × 1 ping / 30s ≈ **2.88B rows/day**. Do **not** keep raw pings in MySQL beyond 7–30 days. Stream to Kafka → ClickHouse / S3 + Athena for analytics. MySQL holds the latest ping + trip summaries only.

### 5.4 Indexing & query rules

- Always include the leading column of an index in WHERE.
- Use covering indexes for hot read paths (loads search, wallet ledger).
- Avoid `SELECT *` in service code — explicit columns only.
- For OLAP / dashboards, query a replica or ClickHouse — never the primary.

---

## 6. API Design

- **Style:** REST + JSON, OpenAPI 3.1 spec **first**, code generated for both server controllers and TypeScript SDK.
- **Versioning:** URL prefix `/v1/`; never break v1, additive only.
- **Auth:** `Authorization: Bearer <JWT>`; refresh via `/auth/refresh`. Service-to-service calls use mTLS + signed JWTs.
- **Pagination:** Cursor-based (`?cursor=...&limit=50`). Never offset for hot tables.
- **Idempotency:** `Idempotency-Key` header on POSTs that mutate money or external state (FASTag recharge, payout, loan EMI).
- **Errors:** RFC 7807 problem+json. Stable `code` field for clients.
- **Rate limits:** Per-user + per-IP via Redis token bucket at gateway.

### 6.1 Sample contract — Loads search

```http
GET /v1/loads?origin_pincode=560103&radius_km=80&truck_type=14W&limit=50
Authorization: Bearer ...

200 OK
{
  "items": [
    {
      "id": "01JEXYZ...",
      "origin": { "lat": 12.93, "lng": 77.69, "pincode": "560103" },
      "destination": { "pincode": "400001" },
      "weight_tons": 12.5,
      "expected_price_inr": 45000,
      "pickup_at": "2026-04-29T08:30:00Z",
      "shipper": { "id": "...", "rating": 4.6 }
    }
  ],
  "next_cursor": "eyJpZCI6Ij..."
}
```

---

## 7. Frontend (Next.js 15) Architecture

### 7.1 Apps

- **web-driver / owner**: Hindi-first, Tailwind 4, mobile-first PWA, dark mode for night-driving views.
- **web-shipper**: Desktop-first B2B portal. Bulk load posting, fleet dashboards, MIS reports.
- **admin-console**: Internal ops — KYC review, dispute resolution, loan underwriting workbench.

### 7.2 Patterns

- **App Router** with **Server Components** by default; client components only where interactivity is needed.
- **Server Actions** for mutations on internal flows; REST endpoints for everything mobile/SDK-bound.
- **Streaming** + `loading.tsx` for slow lists (loads search, ledger).
- **Partial Pre-Rendering (PPR)** for marketing pages.
- **next-intl** for `en-IN`, `hi-IN`, `ta-IN`, `te-IN`, `kn-IN`, `mr-IN` (driver languages).
- **Auth:** `auth.js` (NextAuth v5) with phone-OTP credentials provider + JWT session.
- **State:** Server state via TanStack Query; minimal client state via Zustand.
- **Forms:** React Hook Form + Zod schemas shared with the backend.
- **Maps:** MapLibre GL + open tiles (OSM India / Mapbox fallback) — cheaper than Google for marketplace-scale views.
- **Performance budget:**
  - LCP < 2.5s on 3G, TBT < 200ms on a low-end Android.
  - JS bundle < 150 KB gzipped on driver pages.
- **A11y:** WCAG 2.2 AA; large tap targets (drivers wear gloves, are mid-50s on average).

---

## 8. Driver Mobile App (React Native)

- **RN 0.76 + Expo** (managed workflow until native modules force ejection).
- **Shared code with web** via `packages/sdk-client` (typed API), `packages/domain-events`, validation schemas.
- **Offline-first**:
  - WatermelonDB / SQLite local store for loads, trips, ledger.
  - Outbox pattern for actions taken offline (bid, accept, mark delivered).
- **Permissions:** Background location (foreground service on Android), camera (RC/insurance scans), SMS read (OTP).
- **Push:** FCM (Android primary); APNs for iOS.
- **Voice & low-literacy UX:** TTS prompts in Hindi/regional languages; voice-driven load acceptance.
- **Crash & analytics:** Sentry + a self-hosted PostHog (avoid sending PII to third parties).

---

## 9. Real-Time / Telematics Pipeline (GPS)

This is the **single highest-throughput** part of the system.

```
[GPS device] --MQTT(TLS)--> [EMQX broker cluster] --> [Kafka topic: gps.pings]
                                                          │
                          ┌───────────────────────────────┼────────────────────────┐
                          ▼                               ▼                        ▼
                  [Stream processor]              [Last-known-loc]          [Cold storage]
                  (Node + KafkaJS or              (Redis hash, TTL 24h)     (S3 + ClickHouse)
                  Flink for heavy work)
                          │
                          ▼
                Trip aggregator → MySQL (`trips`)
                Geofence/theft → Kafka `alerts.theft`
                Driver-behavior → Kafka `analytics.behavior`
```

### 9.1 Sizing

| Metric | Target |
|---|---|
| Active devices | 1,000,000 |
| Ping interval | 30s (10s when ignition on, 5min when off) |
| Avg pings/sec | ~33,000 |
| Peak pings/sec | ~80,000 |
| MQTT brokers | 4–6 EMQX nodes (each handles 250K connections) |
| Kafka cluster | 6 brokers, RF=3, `gps.pings` 24 partitions |

### 9.2 Storage strategy

- **Redis:** `loc:{deviceId}` → latest ping (TTL 24h). Used by all live-location reads (cheap, O(1)).
- **MySQL `location_pings`:** Last 7 days only; partitioned by day; auto-drop old partitions.
- **ClickHouse / S3+Iceberg:** All historical pings, columnar, compressed ~10×.
- **Trip summaries:** Aggregated row per trip (start, end, distance, duration, idle time) in MySQL.

---

## 10. Payments, Wallet, FASTag, Fuel Card

### 10.1 Wallet — Double-entry ledger

- **Source of truth:** `ledger_entries` (append-only). `wallets.balance_paise` is a **denormalized** projection rebuilt from the ledger nightly and validated.
- All money mutations go through one path:
  ```
  POST /v1/wallet/transactions
  Headers: Idempotency-Key: <uuid>
  Body: { from_wallet, to_wallet, amount_paise, reason_code, ref_type, ref_id }
  ```
  Implementation: a single MySQL transaction that inserts two ledger rows (debit + credit) and updates both wallet versions with optimistic locking.
- Never use floats. Never compute balance from a single column without ledger reconciliation.

### 10.2 External rails

| Use case | Rail / partner | Notes |
|---|---|---|
| Bank top-up | UPI (Razorpay / Cashfree / NPCI) | Lowest cost, instant. |
| Payouts to bank | RTGS/NEFT/IMPS via Razorpay X / Cashfree Payouts | Settle to driver/owner. |
| Cards (own-issued) | RuPay/Visa via NBFC-BC / partner | Co-branded fuel & fleet card. |
| FASTag | NPCI NETC, via partner-bank API | Bank issues tag; you reseller + UX. |
| Fuel | OMC APIs (IOCL/HPCL/BPCL) + card switch | Partner-specific, contract-bound. |

### 10.3 Reconciliation

- Nightly job ingests partner settlement files → matches against ledger → flags exceptions to ops console.
- Unmatched > 24h = P1 incident.

---

## 11. Loans & Underwriting Service

### 11.1 Flow

```
Eligibility check → Application → KYC + Doc OCR → Bureau pull (CIBIL/CRIF)
  → Behavioral scoring (FASTag, Fuel, GPS, Marketplace)
  → Decision engine (rules + ML)
  → Sanction letter → e-sign (Aadhaar eSign / NSDL)
  → Disbursal via partner NBFC → EMI schedule generated
  → Auto-debit (NACH / e-mandate) on EMI date
```

### 11.2 Components

- **Decision engine:** Rules-as-data in MySQL (`underwriting_rules` table, versioned). ML scoring served via a Python microservice (FastAPI + ONNX); the Node service calls it via gRPC.
- **Bureau integration:** CIBIL Commercial / CRIF — caching and consent-locked per RBI norms.
- **Co-lending:** NBFC partner is the lender of record; you are the originator + servicer. Money never sits on your balance sheet (RBI compliance).
- **Audit:** Every decision step is event-sourced for regulator inspection (7-year retention).

---

## 12. Loads Marketplace

### 12.1 Search

- Primary index in **OpenSearch**: geo-shape on origin/destination pincodes, filter on truck-type, weight, pickup window.
- Hot lookups (e.g., "loads near me") use OpenSearch geo_distance queries.
- Write path: MySQL is source of truth → CDC (Debezium) → Kafka → indexer → OpenSearch.

### 12.2 Matching & bidding

- Shipper posts load → fan-out to nearby truckers via push + SMS.
- Truckers bid; shipper accepts → `LoadBooked` event → wallet **hold** for advance.
- Anti-fraud: rate-limit bids per user; flag accounts with high cancellation ratios.
- Dispute flow: ops console with SLA timers, evidence uploads to S3.

---

## 13. Auth, KYC, RBAC

### 13.1 Auth

- **Phone OTP** (SMS + WhatsApp Business). 6-digit, 5-min TTL, 3 attempts.
- Issue **access JWT (15 min)** + **refresh token (30 days, rotated)**.
- Device binding: refresh tokens tied to `device_id` + IP class for fraud detection.

### 13.2 KYC

- **Aadhaar eKYC** via Offline XML or DigiLocker (no UIDAI online auth without licence).
- **PAN verification** via NSDL / Karza / Hyperverge.
- **Vehicle RC:** VAHAN API.
- **Driving licence:** Sarathi / partner aggregator.
- **Bank account:** Penny-drop via Razorpay/Setu.
- All KYC artifacts encrypted at rest (KMS-managed keys), accessed only by services with the right IAM role + audit log.

### 13.3 RBAC

- Roles: `OWNER`, `DRIVER`, `SHIPPER`, `BROKER`, `OPS_AGENT`, `OPS_LEAD`, `UNDERWRITER`, `FINANCE`, `ADMIN`.
- Policies stored declaratively (Cedar / Casbin) so non-engineers can review.

---

## 14. Infrastructure & DevOps

### 14.1 Cloud

- **AWS, ap-south-1 (Mumbai)** primary, **ap-south-2 (Hyderabad)** as DR.
- VPC per environment (dev / staging / prod). Private subnets for DB and services; public only for ALB and NAT.

### 14.2 Compute

- **EKS** (Kubernetes 1.30) for stateless services.
- **RDS for MySQL 8.4** (Multi-AZ, read replicas).
- **ElastiCache Redis 7** (cluster mode).
- **MSK** for Kafka.
- **OpenSearch Service** for search.
- **S3** + Object Lock for compliance data.

### 14.3 CI/CD

- **GitHub Actions:** lint → typecheck → unit test → build container → push to ECR.
- **Argo CD:** GitOps-driven prod deploys. PR-based promotion across envs.
- **Migrations:** Prisma migrate with `--create-only` reviewed in PR; applied via Argo PreSync hook with rollback playbook.
- **Feature flags:** OpenFeature + Unleash (self-hosted) — gate every risky change.

### 14.4 Environments

`local` (docker-compose) → `dev` (shared) → `staging` (prod-like, anonymized data) → `prod`.

---

## 15. Scalability Plan (0 → 10M users)

This is the **scale doc** asked for. Each milestone lists the bottleneck encountered and the fix.

### Stage 1 — MVP (0 → 50K users / ~5K devices)

- **Architecture:** Modular monolith (single NestJS app), single MySQL primary + 1 read replica, single Redis, single Kafka broker.
- **Compute:** 2× t3.large API + 1× t3.medium worker.
- **DB:** db.r6g.xlarge (4 vCPU / 32 GB).
- **Goals:** Validate product, instrument everything, be cheap.
- **Cost:** ~$3K–5K / month.

### Stage 2 — Early growth (50K → 500K users / ~50K devices)

- **Bottleneck:** GPS write throughput, marketplace search latency.
- **Fixes:**
  - Extract **Telematics service** with its own MQTT cluster + Kafka.
  - Move loads search to **OpenSearch**; MySQL becomes source of truth only.
  - Add **2 read replicas** for MySQL; route reports/dashboards to them.
  - Introduce **BullMQ** for async work (notifications, reconciliations).
- **Compute:** EKS with HPA; 4–8 pods per service.
- **Cost:** ~$15K–25K / month.

### Stage 3 — Scale-up (500K → 2M users / ~250K devices)

- **Bottleneck:** Single MySQL primary writes; single OpenSearch cluster; cache stampedes.
- **Fixes:**
  - **Vertical** MySQL first (db.r6g.8xlarge, 32 vCPU / 256 GB) — usually buys 18 months.
  - Split DBs by domain (one RDS per service).
  - **Cache aside** with Redis + request coalescing (singleflight pattern in Node).
  - **CQRS** for read-heavy domains (loads search, ledger summary).
  - Multi-region read replicas if SE Asia / Middle East expansion happens.
- **Cost:** ~$60K–100K / month.

### Stage 4 — Hyperscale (2M → 10M users / 1M devices)

- **Bottleneck:** Single primary still — even an 8xlarge has a write ceiling around 30–50K QPS depending on workload.
- **Fixes:**
  - **Shard MySQL** by `user_id` hash (Vitess on top of MySQL is the proven path — YouTube/Slack/Square run this).
  - Move telematics permanent store to **ClickHouse** + S3 Iceberg.
  - Kafka cluster: 12+ brokers, separate clusters per domain (`payments` cluster isolated from `gps` cluster).
  - Multi-AZ / multi-region active-active for critical write paths (wallet, loans).
  - **Edge caching** (CloudFront + Lambda@Edge) for public API GETs.
- **Org cost:** ~$300K+ / month at this scale; revenue should comfortably cover it.

### 15.1 Caching strategy (applies at every stage)

| Data | Cache | TTL | Invalidation |
|---|---|---|---|
| User profile | Redis | 5 min | On `UserUpdated` event |
| Wallet balance (display) | Redis | 30s | Write-through on every txn |
| Loads search results | Redis (per query hash) | 60s | Time-based only |
| Vehicle live location | Redis | 24h (last only) | Overwritten by every ping |
| Static config (rules, fees) | In-process LRU | 5 min | Pub/sub bust on change |

### 15.2 Backpressure & resilience

- **Circuit breakers** (opossum) on every external call (NPCI, OMC, NBFC).
- **Retries:** exponential backoff with jitter, capped 3 attempts; idempotency keys mandatory.
- **Bulkheads:** per-partner thread/connection pools so a slow OMC API can't starve everything.
- **Dead-letter topics** in Kafka for any consumer that fails 3× — alarmed, replayable.

---

## 16. Observability, SRE, SLOs

### 16.1 Pillars

- **Logs:** JSON structured, shipped via Vector → Loki. PII redacted at source.
- **Metrics:** OpenTelemetry → Prometheus / Grafana Mimir.
- **Traces:** OTel SDK → Tempo. Sample 100% on errors, 1% otherwise.
- **RUM:** Frontend perf via Sentry + a self-hosted PostHog.

### 16.2 SLOs (target)

| Service | SLI | SLO |
|---|---|---|
| API gateway | p99 latency | < 400 ms |
| Loads search | p95 latency | < 250 ms |
| Wallet write | p99 latency / success | < 500 ms / 99.95% |
| Telematics ingest | drop rate | < 0.1% |
| Mobile app | crash-free sessions | > 99.5% |
| Auth OTP | delivery < 30s | > 98% |

Each SLO has an error budget; exceeded budget → freeze on non-fix releases.

### 16.3 On-call

- 24×7 rotation, primary + secondary.
- Pager: PagerDuty / Opsgenie.
- Runbooks in repo (`/docs/runbooks/<service>.md`), linked from every alert.

---

## 17. Security & Compliance

- **PCI DSS** scope minimization — never store full PAN; tokenize via partner.
- **RBI Digital Lending Guidelines (2022, latest 2025 amendments)** — borrower data localization, consent, key fact statement, cooling-off.
- **DPDP Act 2023** — purpose limitation, consent ledger, data subject rights APIs.
- **Encryption:** TLS 1.3 in transit; AES-256-GCM at rest (KMS).
- **Secrets:** AWS Secrets Manager / HashiCorp Vault — never in env files committed to git.
- **AppSec:** SAST (Semgrep) + SCA (Dependabot/Snyk) + container scan (Trivy) on every PR.
- **Pen tests:** Quarterly external; annual ISO 27001 / SOC 2 alignment.
- **Audit log:** Append-only `audit_db.events`, replicated to S3 with Object Lock for 7 years.

---

## 18. Phased Delivery Roadmap

| Phase | Duration | Scope |
|---|---|---|
| **0 — Foundations** | 0–4 wks | Monorepo, CI/CD, Terraform, EKS, MySQL, auth (OTP), users/vehicles modules. |
| **1 — Loads Marketplace MVP** | 4–10 wks | Post/search/bid/book + wallet hold + driver app skeleton. |
| **2 — Wallet + Payouts** | 8–14 wks | UPI top-up, ledger, payouts, partner reconciliation. |
| **3 — Telematics** | 12–20 wks | MQTT ingest, last-known location, trips, basic geofence/theft. |
| **4 — FASTag** | 18–24 wks | Partner integration, recharge UX, toll txn ingest, Gold tier. |
| **5 — Fuel Card** | 22–30 wks | Card issuance, swipe events, rewards, OMC integration. |
| **6 — Loans** | 28–40 wks | Underwriting, NBFC partner, e-sign, NACH, EMI ops. |
| **7 — Insurance + Used Trucks** | 36–48 wks | Bundled add-ons, listings marketplace. |
| **8 — Scale & SRE** | continuous | Sharding prep, multi-region DR, error-budget hygiene. |

---

## 19. Cost Model (Indicative, AWS ap-south-1)

| Stage | Users | Monthly infra (USD) |
|---|---|---|
| MVP | < 50K | $3K–5K |
| Early growth | 500K | $15K–25K |
| Scale-up | 2M | $60K–100K |
| Hyperscale | 10M | $300K+ |

Rule of thumb: **infra cost ≈ 5–8% of revenue** at steady state. If higher, you have a unit-economics problem, not an infra problem.

---

## 20. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Regulatory shifts (RBI digital lending, NETC fees) | Modular partner integrations; abstract behind interfaces; legal counsel on retainer. |
| Single-vendor lock-in (Razorpay, OMC) | Always design with 2 partners per critical rail; live/standby. |
| GPS device economics | Negotiate volume contracts; allow BYO-device (OBD-II generic) tier. |
| Driver app abandonment | Offline-first, Hindi-first, voice-prompted, low-data mode (< 5MB/day). |
| Money loss from race conditions | Double-entry ledger, idempotency keys, optimistic locking, daily reconciliation. |
| Fraud (fake loads, fake bids, KYC mules) | ML-driven risk scoring, device fingerprinting, manual review queue, partner KYC checks. |
| MySQL write ceiling at scale | Pre-plan Vitess sharding by user_id from day 1 in schema (no cross-shard queries). |
| Regulatory data residency | All prod data in ap-south-1; backups encrypted with India-region KMS keys. |

---

## Appendix A — Recommended Open-Source Libraries (Node side)

- `nestjs/*`, `fastify`, `prisma`, `kafkajs`, `bullmq`, `ioredis`
- `zod`, `class-validator`, `class-transformer`
- `pino` (logging), `@opentelemetry/*`, `nestjs-pino`
- `casl` or `casbin` (authz), `argon2` (passwords if any)
- `bignumber.js` only if you must do JS-side math; prefer DB-side for money.
- `axios-retry`, `opossum` (circuit breaker), `p-limit`, `p-queue`
- `mqtt`, `aedes` / EMQX client SDK
- `dayjs` + `dayjs/plugin/utc` (no moment.js)

## Appendix B — Recommended Libraries (Next.js / RN side)

- `next@15`, `react@19`, `tailwindcss@4`, `shadcn/ui`, `framer-motion`
- `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`
- `next-intl`, `next-auth@5`
- `maplibre-gl`, `react-map-gl`
- `expo`, `expo-router`, `expo-location`, `expo-notifications`
- `@nozbe/watermelondb`, `react-native-mmkv`
- `sentry-expo`, `posthog-react-native`

## Appendix C — Open Questions to Resolve Before Building

1. **NBFC partner** for lending — own NBFC long-term, or partnership-only?
2. **GPS hardware** — own SKU, BYO, or both tiers?
3. **Pricing** — subscription per service vs unified plan; free tier for marketplace?
4. **Geographic scope** — India-only Phase 1, or design for SAARC/SEA from day 1?
5. **Languages at launch** — committing to all 6 from MVP doubles QA cost.
6. **Trust & safety bar** — manual KYC review SLA (4h? 24h?) drives ops headcount.

---

*Document version: v1.0 — 2026-04-27. Owner: Engineering. Update on every major architectural change.*
