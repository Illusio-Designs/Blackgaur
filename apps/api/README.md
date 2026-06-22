# Blackgaur TMS — Backend API

Enterprise Transport Management System REST API. Plain JavaScript (Node 20, CommonJS) +
Express + Prisma (MySQL 8). Implements RBAC, MSG91 OTP auth, FASTag & Fuel Card
integration, RCM/GST invoicing, audit logging, and reporting per
`TMS_ARCHITECTURE_v3.txt`.

## Quick start

```bash
cd apps/api
cp .env.example .env          # fill DATABASE_URL + secrets (works with defaults in dev)
npm install
npm run prisma:generate
npm run prisma:push           # or: npm run prisma:migrate   (needs a live MySQL)
npm run seed                  # roles + permissions + branch + admin user
npm run dev                   # nodemon src/server.js  (http://localhost:4000)
```

Health check: `GET /health`. All API routes are mounted under `/v1`.

### Zero-dependency boot
The API boots with **no external services**: MSG91, FASTag (IHMCL/HDFC), Fuel Card
(HPCL/IOCL), and S3 all run in guarded **stub mode** when their credentials are blank.
- OTP: in dev, the generated OTP is logged to the console and any 6-digit code is accepted.
- File uploads fall back to local disk under `apps/api/uploads/`.
- PDF generation requires the optional `pdfkit` dependency.

## Environment
See `.env.example` for the full list. Key variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | token signing (rotate in prod) |
| `ENCRYPTION_KEY` | 64-hex (32-byte) AES-256 key for fuel card numbers |
| `MSG91_*` | OTP flow; blank => stub mode |
| `IHMCL_* / HDFC_FASTAG_*` | FASTag issuer APIs |
| `HPCL_* / IOCL_*` | Fuel card APIs |
| `AWS_*` | S3 storage; blank => local-disk fallback |
| `FASTAG_SYNC_CRON / FUEL_SYNC_CRON / DOC_EXPIRY_CRON` | worker schedules |
| `COMPANY_*` | GST/invoice computation + PDF header |

In `NODE_ENV=production` the server refuses to start with default/insecure secrets.

## Route surface (`/v1`)

| Group | Routes |
| --- | --- |
| Auth (public) | `POST /auth/request-otp`, `POST /auth/verify-otp`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Users | `GET/POST /users`, `GET/PUT /users/:id`, `PATCH /users/:id/toggle-active`, `DELETE /users/:id` |
| Roles | `GET/POST /roles`, `PUT /roles/:id/permissions`, `DELETE /roles/:id` |
| Trips | `GET/POST /trips`, `GET/PUT/DELETE /trips/:id`, `PATCH /trips/:id/status`, `POST /trips/:id/pod` (multipart) |
| Expenses | `GET /expenses`, `GET /expenses/summary`, `POST /expenses` (multipart receipt), `PATCH /expenses/:id/approve`, `PATCH /expenses/:id/reject` |
| Invoices | `GET/POST /invoices`, `GET /invoices/:id`, `GET /invoices/:id/pdf`, `PATCH /invoices/:id/approve`, `PATCH /invoices/:id/mark-paid`, `POST /invoices/:id/send`, `DELETE /invoices/:id` |
| FASTag | `GET/POST /fastag/wallets`, `GET /fastag/wallets/:id`, `PATCH /fastag/wallets/:id`, `POST /fastag/wallets/:id/sync-balance`, `POST /fastag/wallets/:id/recharge`, `GET /fastag/transactions`, `GET /fastag/transactions/export`, `POST /fastag/transactions/sync`, `POST /fastag/transactions/match-trips` |
| Fuel cards | `GET/POST /fuel-cards`, `GET /fuel-cards/:id`, `PATCH /fuel-cards/:id`, `POST /fuel-cards/:id/sync-balance`, `POST /fuel-cards/:id/block`, `POST /fuel-cards/:id/unblock` |
| Fuel txns | `GET /fuel-transactions`, `GET /fuel-transactions/export`, `POST /fuel-transactions/sync`, `POST /fuel-transactions/match-trips` |
| Clients | `GET/POST /clients`, `GET/PUT/DELETE /clients/:id` |
| Vehicles | `GET/POST /vehicles`, `GET/PUT/DELETE /vehicles/:id` |
| Reports | `GET /reports/{dashboard,trips,finance,fastag,fuel,clients,audit}` |
| Audit | `GET /audit-logs` (immutable, read-only) |

### Standard envelope
Success: `{ success, data, meta?, filters_applied? }`. Error: `{ success:false, error:{ code, message, details? } }`.
List endpoints accept universal query params: `page, limit (max 100), sort_by, sort_order, search, from_date, to_date, include` plus per-resource filters.

## Module overview
- `src/config/env.js` — env loader + prod secret validation + integration feature flags.
- `src/lib/` — `prisma` (singleton), `jwt`, `response`, `pagination`, `gst` (RCM/GST + invoice number), `crypto` (AES-256-GCM + masking), `upload` (multer), `AppError`, `asyncHandler`.
- `src/middleware/` — `authenticate`, `hasPermission` (scope all/own/branch), `auditLogger`, `rateLimiter`, `validate` (Zod), `errorHandler`.
- `src/services/` — `msg91`, `fastag/{ihmcl,hdfc,fastagSync}`, `fuel-card/{hpcl,iocl,fuelSync}`, `gst`, `pdf`, `s3`.
- `src/controllers/` — one per resource, real Prisma logic, audit on mutations.
- `src/routes/` — wired with `authenticate` + `hasPermission` + `validate`; `index.js` exposes `registerRoutes(app)`.
- `src/workers/` — `fastagSync` (15m), `fuelSync` (30m), `documentExpiry` (daily); `startWorkers()` skipped in test.

## Security highlights
- httpOnly + Secure + SameSite=Strict cookies for access/refresh tokens.
- CORS whitelisted to `CORS_ORIGIN`. Helmet enabled.
- Fuel card numbers AES-256-GCM encrypted at rest, masked (`****1234`) in responses; only admin sees last 4.
- Invoice numbers generated server-side, financial-year sequential, allocated inside a transaction.
- RCM/GST always recomputed server-side; client amounts are display-only.
- Audit logs are immutable (no update/delete path).
- Upload MIME + 10 MB size guards.
