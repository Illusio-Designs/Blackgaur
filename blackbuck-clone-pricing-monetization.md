# Pricing & Monetization Plan — BlackBuck-Style Trucking Super-App

> **Purpose:** Concrete, India-market-calibrated pricing for every product line, with revenue assumptions, unit economics, and a 3-year revenue projection.
> **Inputs:** BlackBuck FY24/FY25 reported numbers, OMC/NPCI public rate cards, NBFC origination norms, current Indian SaaS / fintech benchmarks (April 2026).

---

## Executive Summary

| Product | Headline Price (Customer) | What You Earn | Type | Margin Profile |
|---|---|---|---|---|
| FASTag | ₹100 issuance + min ₹100 wallet | ₹40–₹120 / tag + 0.4–0.7% of recharge GTV + interchange share | Commission | Medium (40–60%) |
| FASTag Gold (premium) | ₹299 / year | ₹299 minus partner cut (~₹150–₹200 net) | Subscription | High (80%+) |
| GPS Hardware | ₹2,499 one-time | ₹100–₹400 net (loss-leader) | One-time | Low / breakeven |
| GPS Subscription | ₹199 / month or ₹1,999 / year | ₹150–₹180 / mo net | SaaS recurring | **Very high (90%+)** |
| GPS + Anti-theft (Relay-equivalent) | +₹99 / month | ~₹80 / mo net | SaaS add-on | Very high |
| Fuel Card | ₹0 issuance, ₹199 annual fee | 0.6–1.2% per swipe (OMC commission) + float | Commission + float | High (70–80%) |
| Loads Marketplace | Free for truckers; ₹0–₹49 per posted load for shippers | 1.5–2.5% take rate of freight value (capped ₹999) | Take rate | High (75%+) |
| Vehicle Loans | EMI per partner NBFC rate | 2–3% origination + 0.5–1% servicing | Lead gen + servicing | Very high (85%+) |
| Insurance (bundle) | ₹0 to driver (built into fuel card) | 8–15% commission on premium | Referral | Very high |
| Used Trucks | ₹499 listing + 1% sale commission (capped ₹9,999) | Listing + commission | Take rate | High |

**Target revenue mix at maturity (Year 3):** Payments ~45% · Telematics ~30% · Lending ~15% · Marketplace ~7% · Other ~3%.

---

## 1. FASTag

### 1.1 Customer-facing pricing

| Item | Price |
|---|---|
| New tag issuance | **₹100** (one-time) |
| Min wallet balance at issue | **₹100** |
| Re-issue / replacement | **₹150** |
| Annual maintenance | **₹0** (loss-leader) |
| **FASTag Gold** (anti-blacklist + priority resolution) | **₹299 / year** |

> NPCI's MDR ceiling and partner-bank arrangements set the floor. ₹100 is the de facto market price.

### 1.2 What you earn (per tag, per year, modeled)

Assumptions: avg trucker recharges ₹30,000 / month → ₹3,60,000 / year GTV per tag.

| Source | Rate | Per tag / year |
|---|---|---|
| Issuance commission (from issuing bank) | ~₹40–80 net | ₹60 |
| Recharge commission | ~0.5% of GTV | ₹1,800 |
| Toll interchange share | ~0.10–0.15% of GTV | ₹450 |
| Gold subscription (15% conversion at ₹299) | 0.15 × ₹299 | ₹45 |
| **Total per tag / year** | | **~₹2,355** |

### 1.3 Unit economics

- CAC per FASTag user: ₹150–₹250 (digital + agent).
- Payback: < 2 months.
- Gross margin after partner-bank revenue share: ~45–55%.

### 1.4 Required partnerships

- **Issuing bank** (e.g., IDFC First, Axis, Equitas, AU SFB) — sponsor your tag SKU.
- **NPCI NETC** certification — mandatory.
- Cross-recharge support (UPI, cards, wallets) via PA partner (Razorpay/Cashfree).

---

## 2. GPS / Telematics

### 2.1 Pricing tiers

| Tier | Hardware (one-time) | Subscription | What's included |
|---|---|---|---|
| **Basic** | ₹2,499 | ₹199 / mo or ₹1,999 / yr | Live location, trip history, geofence, 1 user |
| **Pro** | ₹2,999 | ₹349 / mo or ₹3,499 / yr | Basic + driver behaviour, fuel-theft alerts, 3 users, API access |
| **Fleet** | ₹2,999 (per device) | ₹499 / mo or ₹4,999 / yr | Pro + multi-vehicle dashboard, MIS reports, custom geofences |
| **Anti-theft Add-on** | — | +₹99 / mo | Recovery service, immobilizer relay, 24×7 monitoring |

### 2.2 What you earn (per device, per year)

Assumptions: 70% Basic, 25% Pro, 5% Fleet; 30% adopt anti-theft add-on.

| Tier | ARPU / yr | Hardware contribution | Net / yr |
|---|---|---|---|
| Basic | ₹1,999 | ₹0 (cost neutral) | ~₹1,800 (90%) |
| Pro | ₹3,499 | ₹0 | ~₹3,150 |
| Fleet | ₹4,999 | ₹0 | ~₹4,500 |
| Anti-theft add-on (avg) | ₹1,188 | — | ~₹950 |

**Blended ARPU per device / year: ~₹2,400. Blended margin: 90%+ at scale.**

### 2.3 Hardware cost reality check

- BOM for a 4G GPS tracker (basic): ₹1,400–₹1,800 landed.
- BOM for advanced (OBD-II + accelerometer + ignition cut): ₹2,000–₹2,400.
- Sell at ₹2,499–₹2,999 → roughly breakeven on hardware. Profit comes from subscription.
- Bulk procurement from Shenzhen ODMs (Concox, Jimi, Teltonika) cuts ~15%.

### 2.4 Why this is the highest-margin product

- After hardware breakeven, marginal cost of an extra subscriber is server + SIM data (~₹15–₹25/month).
- ₹199 – ₹25 = ₹174 net / month / device → 87% gross margin.
- This is the **first segment that should hit profitability** in your model.

---

## 3. Fuel Card

### 3.1 Customer pricing

| Item | Price |
|---|---|
| Card issuance | **₹0** (acquisition tool) |
| Annual fee | **₹199** (waived if monthly load > ₹15,000) |
| Reload (UPI / netbanking) | Free |
| Cashback / reward | 0.25–0.5% on fuel spend |

### 3.2 What you earn (per active card, per year)

Assumptions: avg active card spends ₹50,000 / month → ₹6,00,000 / year.

| Source | Rate | Per card / year |
|---|---|---|
| OMC commission | 0.6–1.2% of fuel spend | ₹3,600–₹7,200 |
| Float income (avg ₹4,000 prepaid for ~7 days) | ~6% APY | ₹47 |
| Annual fee (50% of cards pay it) | 0.5 × ₹199 | ₹100 |
| Reward outflow | –0.4% of spend | –₹2,400 |
| **Net / card / year** | | **~₹2,800** |

### 3.3 Required partnerships

- **OMCs (IOCL / HPCL / BPCL)** — direct contract or through a fuel-card aggregator (e.g., Volopay, EnKash).
- **Card-issuing bank or PPI licence** — RuPay/Visa rails.
- Aim to launch with **2 OMCs (HPCL + BPCL)** to avoid single-vendor risk; add IOCL later.

### 3.4 Adjacent monetization

- Bundle insurance (driver, helper, roadside assistance) — net ₹300–₹500 per card / year in commission, paid for by the OMC margin.
- Use spend pattern as a **credit signal** for loan underwriting.

---

## 4. Loads Marketplace

### 4.1 Pricing model (recommended: free truckers, light shipper monetization)

**Truckers (drivers/owners): always free.** They are the supply you cannot afford to lose.

**Shippers:**

| Tier | Price | What they get |
|---|---|---|
| Free | ₹0 | Up to 5 loads/month, basic visibility |
| **Plus** | ₹999 / mo | 50 loads/month, priority placement, verified badge |
| **Pro** | ₹4,999 / mo | Unlimited loads, API access, dedicated relationship manager |

**Per-booking take rate** (charged to shipper, optional opt-in for "Verified Booking"):

- **1.5–2.5%** of freight value, capped at **₹999 per booking**.
- Includes wallet escrow, dispute resolution, and signed e-proof of delivery.
- Free path remains available for shippers who handle payment offline (you still get the data).

### 4.2 What you earn (Year 2 target)

Assumptions: 200K monthly active shippers, avg 8 bookings/month, avg freight ₹35,000, 30% on Verified Booking.

- Verified Booking revenue: 200K × 8 × 0.3 × ₹35,000 × 1.8% = **~₹30 Cr / month** = ₹360 Cr / yr.
- Subscription revenue (10K Plus, 1K Pro): 10K × ₹999 + 1K × ₹4,999 = ₹1.5 Cr / mo = ₹18 Cr / yr.

### 4.3 Don't do this

- **Don't charge truckers a per-bid fee** — kills supply, drives them back to brokers.
- **Don't enforce escrow on every booking** — lose the offline shippers entirely. Make it opt-in with strong incentives (faster payment, dispute coverage).

---

## 5. Vehicle Loans

### 5.1 Loan products

| Product | Ticket size | Tenure | Customer-facing rate |
|---|---|---|---|
| **Used commercial vehicle (CV) loan** | ₹3 L – ₹15 L | 12–48 mo | 15–22% reducing |
| **New CV loan** | ₹8 L – ₹35 L | 24–60 mo | 12–16% reducing |
| **Working capital (against fuel/toll history)** | ₹25 K – ₹2 L | 3–6 mo | 22–30% flat-equivalent |
| **EMI top-up / rollover** | ₹10 K – ₹50 K | 1–3 mo | 24–32% |

> You don't lend off your own balance sheet — partner NBFC is the lender of record.

### 5.2 What you earn

Per loan disbursed:

| Component | Rate | Per ₹5L loan |
|---|---|---|
| Origination / sourcing fee (paid by NBFC) | 2.0–3.0% of principal | ₹12,500 |
| Processing fee shared from customer | 1.0–1.5% (you keep 50%) | ₹3,750 |
| Servicing fee (collection, EMI ops) | 0.5–1.0% / yr × tenure | ₹5,000 over 24 mo |
| Insurance + add-on commission (single premium) | 8–12% of premium | ₹2,400 |
| **Total per loan** | | **~₹23,650** (≈ 4.7% of principal) |

### 5.3 Volume model (Year 2 → Year 3)

- Year 2: 12,000 loans × avg ₹4L = ₹480 Cr disbursal → ~₹22.5 Cr revenue.
- Year 3: 50,000 loans × avg ₹4.5L = ₹2,250 Cr disbursal → ~₹110 Cr revenue.

### 5.4 Required partnerships

- **2–3 NBFC partners** (IIFL, Mahindra Finance, Tata Capital, Cholamandalam, Shriram). Avoid single dependency.
- **Bureau access** — CIBIL Commercial + CRIF.
- **eKYC + e-sign** — DigiLocker, NSDL eSign.
- **NACH / e-mandate** — via Razorpay / Setu / NPCI directly.

### 5.5 Risk note

- Indian RBI **Digital Lending Guidelines (2022 + 2025 amendments)** are strict — Key Fact Statement, cooling-off period, no auto-debit beyond approved limit, borrower-data localization.
- Build the audit/consent ledger from day 1; retro-fitting is painful.

---

## 6. Insurance

### 6.1 Bundling strategy

Don't sell insurance as a standalone product (low conversion, low LTV). **Bundle it free or near-free into other products**:

| Insurance | Bundle | Customer pays | You earn (commission) |
|---|---|---|---|
| Driver accident cover (₹2L sum assured) | Inside fuel card | ₹0 | ₹120 / yr |
| Helper accident cover (₹1L) | Inside fuel card | ₹0 | ₹60 / yr |
| Roadside assistance | Inside FASTag Gold | ₹0 | ₹40 / yr |
| Vehicle comprehensive (renewal) | Cross-sell at expiry | Market premium | 12–15% of premium (₹3,000–₹6,000 typical) |
| Loan-linked credit life | Inside loan disbursal | ~2% of principal | 8% of premium (₹800 / loan) |

### 6.2 Volume math (Year 3)

- 800K active fuel-card users × ₹220 avg = **₹17.6 Cr / yr**.
- Vehicle comprehensive renewals: 50K policies × ₹4,000 avg = **₹20 Cr / yr**.
- Loan-linked credit life: 50K loans × ₹800 = **₹4 Cr / yr**.
- **Total: ~₹40 Cr / yr** at maturity.

---

## 7. Used Trucks Marketplace

### 7.1 Pricing

| Item | Price |
|---|---|
| Free listing (DIY) | ₹0 |
| **Featured listing** | ₹499 / 30 days |
| **Verified inspection report** (paid 3rd-party check) | ₹1,499 / vehicle |
| **Sold commission** | 1% of sale price, capped at ₹9,999 |
| **Loan-attached deal** | Standard loan origination + ₹1,499 dealer fee |

### 7.2 Revenue / sale (avg ₹6 L vehicle)

- Inspection: ₹1,499
- Sale commission: ₹6,000
- Loan origination (40% attach): 0.4 × ₹14,000 = ₹5,600
- **Per sale: ~₹13,000 net.**
- 5,000 sales/year by Year 3 → **₹6.5 Cr / yr**.

This stays small in the early years. Treat it as an LTV-extender for the lending business, not a standalone P&L.

---

## 8. Wallet & Payments — Float and Float-Adjacent Income

This is the quiet-but-real revenue stream most clones miss.

- Total prepaid float across FASTag wallet, fuel card balance, marketplace escrow at scale (Year 3): **~₹400 Cr** (illustrative).
- Park in liquid funds / overnight sweeps at ~6% APY → **₹24 Cr / yr** before regulatory adjustments.
- RBI rules require trust accounts and pass-through customer interest in some flows — model conservatively at **₹15 Cr / yr**.

---

## 9. 3-Year Revenue Projection (Indicative)

Assumptions:
- **Year 1:** 50K active operators, MVP across FASTag + GPS + Loads.
- **Year 2:** 250K active operators; Fuel + Loans go live.
- **Year 3:** 800K active operators; full suite live.

| Stream (₹ Cr) | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| FASTag commissions | 8 | 45 | 160 |
| GPS subscriptions | 6 | 35 | 110 |
| Fuel card commissions | 0 | 18 | 75 |
| Loads marketplace | 1 | 8 | 35 |
| Vehicle loans | 0 | 22 | 110 |
| Insurance | 0 | 7 | 40 |
| Used trucks | 0 | 1 | 6 |
| Float income (net) | 0.5 | 4 | 15 |
| **Total revenue** | **~15.5 Cr** | **~140 Cr** | **~551 Cr** |
| Operating margin | –40% (–6 Cr) | +5% (+7 Cr) | +20% (+110 Cr) |

> For comparison: BlackBuck did ₹296.9 Cr in FY24 and ₹462 Cr in FY25 with 1M operators. A clone with 800K operators reaching ~₹550 Cr by Year 3 is aggressive but not unrealistic, **assuming the FASTag partnership lands quickly** — that's the single biggest gating factor.

---

## 10. Pricing Principles (the "Why" Behind the Numbers)

1. **Make the rails cheap; charge for value-add.** Tags and cards near-cost; subscriptions and credit are where margin lives.
2. **Never charge supply (truckers) on the marketplace.** Charge demand (shippers) only when they get measurable value (escrow, verified delivery).
3. **Bundle insurance — never sell it standalone.** Conversion on standalone insurance among truckers is < 3%; bundled it's 60%+.
4. **Cross-sell is the business model.** Single-product LTV is mediocre; 3+ product LTV is 4–6× higher.
5. **Float income is real.** Design wallet/escrow flows to maximize compliant float without breaking RBI trust-account rules.
6. **Credit is the prize.** Every other product is a data-collection exercise to underwrite loans nobody else can.

---

## 11. Pricing Anti-Patterns to Avoid

- **Per-transaction fees on truckers** — they'll switch to a competitor or go offline.
- **Tiered FASTag pricing that's hard to explain in Hindi at a roadside stop.** Keep it dead simple.
- **Free everything for too long** — burns cash without learning what truckers will actually pay for. Charge ₹199/yr for SOMETHING from day 1.
- **Heavy-handed escrow defaults** in the marketplace — kills network density.
- **Lending without partner diversity** — single NBFC dependency is an existential risk if their portfolio sours.
- **Over-engineering rewards.** Drivers want predictable cash savings, not airline-style point systems.

---

## 12. Operational Checklist Before Launch

- [ ] Bank partnership signed (FASTag) — **must be in writing before raising seed**.
- [ ] OMC contract MOU (HPCL or BPCL) for Year-2 fuel card.
- [ ] PPI licence applied for, or PPI partner identified (e.g., Yes Bank, RBL).
- [ ] Razorpay / Cashfree merchant + payouts onboarded.
- [ ] DigiLocker / NSDL eSign integrations live in staging.
- [ ] CIBIL Commercial sandbox access.
- [ ] 1 NBFC term-sheet for co-lending.
- [ ] Hindi + 4 regional languages translation pipeline.
- [ ] Audit + consent ledger schema implemented (RBI digital-lending compliance).
- [ ] Grievance redressal page live with named Nodal Officer.

---

## Appendix — Benchmarks Used

| Source | What it informed |
|---|---|
| BlackBuck FY24 / FY25 reported financials | Revenue mix shape, margin profile |
| NPCI NETC public docs | FASTag commission floors |
| OMC (IOCL/HPCL/BPCL) dealer commission norms | Fuel card take-rates |
| RBI Digital Lending Guidelines 2022 + 2025 | Lending compliance, partner structure |
| IRDAI insurance commission caps | Insurance commission ceilings |
| Indian SaaS benchmarks (Chargebee, Zoho disclosures) | Telematics ARPU |

---

*Document version: v1.0 — 2026-04-27. Owner: Product + Finance. Update quarterly with actuals.*
