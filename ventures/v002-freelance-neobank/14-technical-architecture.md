# Technical Architecture: SoloFi (Freelance Neobank)

## 🏗️ System Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
|                      SOLOFI MOBILE APP                      |
|  [Flutter or React Native] (iOS / Android)                  |
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTPS API + Websockets for real-time balances)
┌─────────────────────────────────────────────────────────────┐
|                 SOLOFI MIDDLEWARE (GO/NODE)                 |
|  [Auth/JWT] ←→ [Ledger Cache] ←→ [Tax/Categorization AI]    |
└─────────────────────────────────────────────────────────────┘
  ↓ (Identity & Risk)                       ↓ (Core Banking)
┌────────────┐                         ┌──────────────────────┐
|   Stripe   |                         | ClearBank / Marqeta  |
|  Identity  |                         | (The actual Bank)    |
└────────────┘                         └──────────────────────┘
```

---

## 🔧 Tech Stack

### Mobile Frontend (The "Product")
| Component | Technology | Rationale |
|-----------|------------|-----------|
| App Framework | React Native (Expo) or Flutter | 90% code reuse across iOS and Android. Essential for a Seed-stage startup to iterate quickly. |
| State Management| Zustand / Redux | Managing localized caching so the app feels instantaneous even on bad 4G networks. |
| UI/UX | Custom Design System | We are competing on aesthetics. The UI must feel like a premium lifestyle app, not a dusty bank. |

### Backend Middleware (The "Orchestrator")
| Component | Technology | Rationale |
|-----------|------------|-----------|
| API Core | Go (Golang) or Node.js | Microservices architecture needed to handle millions of tiny, concurrent webhook events from the BaaS provider. |
| Database | PostgreSQL | Storing user identities, configurations (e.g., Tax Vault % settings), and materialized views of the ledger. |
| Caching | Redis | Storing session states and rate-limiting to prevent transaction flooding attacks. |

### Infrastructure (The "Bank")
We do not build a core banking ledger. We rent it.
| Component | Partner | Purpose |
|-----------|---------|---------|
| Core Ledger / Rails | ClearBank (UK) or Cross River (US) | Provides Faster Payments, ACH, deposit insurance, and the master ledger. |
| Card Issuing | Stripe Issuing / Marqeta | Generating Virtual Cards for Apple Pay and printing the physical Mastercard. |

---

## 🔐 Security Architecture

### KYC & Fraud Prevention
| Measure | Implementation |
|---------|---------------|
| Biometric KYC | Integration with **Onfido** or **Stripe Identity**. User scans government ID and records a live 3D selfie. Blocks 95% of synthetic identity fraud. |
| Device Fingerprinting | Integration with **Sift** or **FingerprintJS** to ensure the phone opening the account is not an emulator running in a Russian server farm. |
| Plaid Auth | When funding the account for the first time, users authenticate their existing external bank via Plaid to ensure "Good Funds." |

---

## 📊 API Design

### Webhook Handling (The hardest part of FinTech)
When a user buys a coffee, Marqeta sends an HTTP Webhook to our Go server. We have exactly ~1.5 seconds to respond with an HTTP 200 to approve or decline the transaction based on our internal ledger balance before the coffee shop's Verifone terminal times out.

```go
POST /v1/webhooks/marqeta/auth
Payload: {
  "user_id": "usr_123",
  "amount": 4.50,
  "merchant": "Starbucks"
}
// Internal Logic: Check user balance LESS the locked Tax Vault funds.
// Respond 200 OK.
```

---

## 📈 Scaling Strategy

### Handling the 1st of the Month
Freelancers get paid massively on the 1st and 15th of the month.
- Incoming ACH/Faster Payment webhooks will spike 100x.
- We decouple webhook ingestion using **Kafka** or **AWS SQS**. The webhook hits the queue, we return an instant 200 OK to the partner bank, and background workers process the balance update and push notifications asynchronously.
