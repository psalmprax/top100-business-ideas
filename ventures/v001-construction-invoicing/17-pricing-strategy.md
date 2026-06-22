# Pricing Strategy: Structura (Construction Invoicing)

## 💰 Pricing Philosophy

### Core Principles

1. **The Subsidized Network**: General Contractors (GCs) control the ecosystem. We charge them a highly predictable, flat SaaS fee that feels "cheap" compared to the hours saved. We make the real money on the Subcontractors who opt-in for liquidity.
2. **FinTech Optionality**: Subcontractors can always use the platform for free if they wait the standard 90 days. We only charge when we provide accelerated value (Early Pay).
3. **Value-Based Tiers**: The GC's SaaS fee scales based on the sheer volume of invoices processed.

---

## 📊 Pricing Tiers

### SaaS Pricing (Charged to the General Contractor)

| Tier                 | Price     | Features                                      | Target                          |
| -------------------- | --------- | --------------------------------------------- | ------------------------------- |
| **Emerging Builder** | £350/mo   | Up to 150 Invoices/mo. 1 Procore Sync.        | Regional custom home builders.  |
| **Commercial GC**    | £1,200/mo | Up to 1,000 Invoices/mo. Unlimited users.     | Mid-market commercial builders. |
| **Enterprise**       | Custom    | Starts at £3,500/mo. Custom ERP integrations. | Top 100 National Builders.      |

### FinTech Pricing (Charged to the Subcontractor)

| Action                         | Pricing              | Description                                                                           |
| ------------------------------ | -------------------- | ------------------------------------------------------------------------------------- |
| **Standard Payment**           | £0 (Free)            | Sub uploads invoice, waits 90 days, gets paid via ACH.                                |
| **"Early Pay" (Factoring)**    | 1.5% - 2.5% Flat Fee | We advance the funds within 48 hours of GC approval. We take the fee off the top.     |
| **Instant Debit/Push to Card** | 1.0% Fee             | Instant payment via Visa/Mastercard rails instead of waiting 3 days for standard ACH. |

---

## 💵 Unit Economics by Tier

### Gross Margin Dynamics

- The SaaS revenue is extremely high margin (85%+), paying for our core AWS and OpenAI API costs.
- The FinTech revenue is lower margin but scales infinitely. If a Subcontractor takes £100,000 early, we charge £2,000. Our cost of capital (borrowing from a warehouse facility at ~8% APR) for 90 days might cost us £800. We net £1,200 on pure financial physics.

---

## 🎯 Pricing Psychology

### Objection Handling

- **GC Objection**: "Why should I pay £1,200 a month for invoice management?"
  - **Rebuttal**: "Your admin makes £60k a year typing data into Sage, and misses £5,000 a month in duplicated line-item fraud. We replace the labor and eliminate the fraud immediately."
- **Subcontractor Objection**: "2% is a huge cut of my invoice."
  - **Rebuttal**: "You are currently floating £50,000 in materials on a 25% APR credit card waiting for the GC to pay. Taking a 2% flat fee to get cash tomorrow is mathematically cheaper than the interest on your debt."

---

## 💳 Billing Strategy

### Dual Billing Rails

- **GC Billing**: Handled via standard Stripe Subscriptions (Credit Card or B2B Bank Transfer) on annual or monthly cadences.
- **Subcontractor Billing**: Handled natively in the flow of funds via Stripe Connect. We never "invoice" the Subcontractor. When £100,000 leaves the GC's account, £98,000 lands in the Subcontractor's account, and £2,000 lands in ours. No collections required.
