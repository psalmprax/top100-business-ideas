# Pricing Strategy: SoloFi (Freelance Neobank)

## 💰 Pricing Philosophy

### Core Principles
1. **Free to Enter, Impossible to Leave**: The core banking product (holding money, using a card, auto-tax vault) must be completely free to drive massive viral acquisition. 
2. **Hidden Mathematics**: We monetize heavily via Interchange (the 1.5% fee Mastercard charges the merchant when our user buys a laptop). The user never sees this fee.
3. **SaaS for Power Users**: We charge a predictable monthly subscription for users who want to treat their freelance gig like a true corporation (LLC formation, multi-currency).

---

## 📊 Pricing Tiers

### Current Pricing (Launch)
| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Solo Free** | £0/mo | Standard Account, Virtual Card, Auto-Tax Vault. | Starting freelancers, side-hustlers. |
| **Solo Pro** | £9.99/mo | Physical Metal Card, Unlimited HTML Invoices, Auto-Sync to Xero/Quickbooks. | Full-time freelancers, high earners. |
| **Solo Global** | £19.99/mo| 0% FX fees, Multi-currency holding accounts (USD/EUR/GBP). | Digital Nomads, International Consultants. |

---

## 💵 Unit Economics by Tier

### Invisible Revenue Streams
- **Interchange**: If a user earns £5,000/mo and spends £2,000/mo on our debit card, we earn roughly £30/mo in pure interchange revenue.
- **Net Interest Margin (NIM)**: If our user base holds £100 Million in deposits overnight, our partner bank lends that out and pays us ~2.0% APY. That yields £2M annually for literally doing nothing but holding cash.

| Tier | Estimated ARPU | Gross Margin |
|------|----------------|--------------|
| Solo Free | £20 / mo (Interchange) | 50% (Mastercard network fees + BaaS costs) |
| Solo Pro | £30 / mo | 70% |
| Solo Global | £50 / mo | 75% |

---

## 🎯 Pricing Psychology

### Objection Handling
- **"Why is the Pro tier £10 a month when Monzo is free?"**
  - **Rebuttal**: "Monzo is a personal account. Solo Pro automatically categorizes your deductible expenses and integrates with Xero. It's a business expense, so it writes itself off."

---

## 📈 Competitor Pricing

| Competitor | Pricing Model | Weakness | Our Advantage |
|------------|---------------|----------|---------------|
| **High Street Banks (Chase, Barclays)**| £5-£15/mo "Business Account" fee | Zero software. High fees. Punishing UX. | We are free to start, and our software actually helps them survive. |
| **QuickBooks Checking** | Free (Tied to QB sub) | Very rigid. | We are younger, cooler, and specifically designed for single-person companies. |

---

## 💳 Billing Strategy

### SaaS Billing
- **Native Wallet Deduction**: Unlike traditional SaaS where we charge their physical credit card via Stripe, we simply deduct the £9.99 directly from their SoloFi ledger balance on the 1st of the month.
- This results in zero failed payments, provided they have a balance, and zero payment processing fees.
