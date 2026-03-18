# Product Feature Roadmap: SoloFi (Freelance Neobank)

## 🎯 Feature Prioritization Framework

### RICE Scoring Example
| Feature | Reach | Impact | Confidence | Effort (Wks) | Score |
|--------|--------|-------------|-----------|-------|-------|
| Biometric Onboarding | 100% | 3.0 | 90% | 4 | **67.5** |
| The "Auto-Tax" Vault | 100% | 3.0 | 80% | 6 | **40.0** |
| Virtual Debit Cards | 90% | 2.5 | 90% | 5 | **40.5** |
| Xero Integration | 30% | 2.0 | 70% | 4 | **10.5** |

---

## 📅 Feature Roadmap

### Q1: MVP (The "Core Ledger")
**Focus**: Table stakes. Proving we can safely hold money, issue a card, and not get shut down for fraud.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **KYC/AML Pipeline** | 🔄 In Progress | Backend | Stripe Identity selfie + passport flow. |
| **Account Generation** | 🟡 Planned | Backend | API call to BaaS provider to mint a Sort Code / Routing Number. |
| **Virtual Mastercard** | ⚪ Planned | Fullstack | Instant Apple Pay / Google Wallet provisioning. |
| **Basic Home Feed** | ⚪ Planned | Mobile | A beautiful list of categorized transactions. |

### Q2: Growth (The "Killer Feature")
**Focus**: The reason people switch to SoloFi.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **The Auto-Tax Vault** | ⚪ Backlog | Backend | Algorithm that moves exactly 25% (or set %) of every *inbound transfer* to a hidden sub-account. |
| **Push Notifications**| ⚪ Backlog | Mobile | Extremely satisfying emoji-filled notifications for getting paid. |
| **Referral Engine** | ⚪ Backlog | Fullstack | Generate unique codes, track installs, credit £50 instantly. |

### Q3: Scale (The "Business OS")
**Focus**: Moving beyond just storing money to actively managing the business.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **1-Click Invoices** | ⚪ Backlog | Frontend | Generate a PDF/Payment link directly from the app to send to a client. |
| **Receipt Capture** | ⚪ Backlog | Mobile | Take a photo of a coffee receipt and attach it to the transaction for tax write-offs. |
| **Physical Cards** | ⚪ Backlog | Ops | Mailing the beautiful, minimalist physical debit card. |

### Q4: Deep FinTech (Monetization)
**Focus**: Increasing ARPU.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Multi-Currency** | ⚪ Backlog | Backend | Holding USD/GBP/EUR (Freelancers often have global clients). |
| **Tax Filing Partner**| ⚪ Backlog | BD/Product| 1-click referral to FreeAgent or a CPA network directly from the app for a 30% rev share. |
| **"SoloFi Pro" Tier** | ⚪ Backlog | Product | Paywalling advanced integrations (Zapier, Xero) for £10/mo. |

---

## 📦 MVP Feature List (Must Haves - P0)

| Feature | Description | Why |
|---------|-------------|-----|
| Apple/Google Pay | Instant virtual card tokenization. | Gen-Z users do not carry physical wallets. Waiting 7 days for plastic kills activation metrics. |
| Faster Payments / ACH | The ability to actually receive the freelancer's money. | It's a bank. It must hold money. |
| Un-blockable Support | Real human chat within 5 minutes. | If you freeze someone's account for a fraud check, they will panic. Chat bots destroy banking trust. |
