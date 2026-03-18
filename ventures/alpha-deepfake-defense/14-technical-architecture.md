# Technical Architecture: LivenessLink

## 🏗️ System Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
|                      CLIENT ENVIRONMENT                     |
|  [SAP / Oracle / Kyriba] ← (Treasury ERP Platform)          |
└─────────────────────────────────────────────────────────────┘
  ↓ (API Request: Wire $5M. Requires Auth)
┌─────────────────────────────────────────────────────────────┐
|                 LIVENESSLINK CORE (GO/RUST)                 |
|  [FIDO2 Server] ←→ [Policy Engine (Multi-sig rules)]        |
└─────────────────────────────────────────────────────────────┘
  ↓ (Push Notification over APNS/FCM)
┌─────────────────────────────────────────────────────────────┐
|                    EXECUTIVE MOBILE DEVICE                  |
|  [iOS App] ←→ [Secure Enclave (FaceID)] ←→ [Private Key]    |
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

### Backend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| API Core | Go (Golang) | The absolute standard for modern cryptography and concurrency. Massive ecosystem for WebAuthn libraries. |
| Datastore | PostgreSQL | Highly relational. Storing public keys, user-to-device mappings, and audit trails. |
| Caching/Queue | Redis | Required for managing the state of temporary "Pending Wire" sessions before they time out. |

### Mobile Client (The Authenticator)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Flutter (or Swift/Kotlin native) | Normally, cross platform is fine, but because we need low-level access to the Biometric APIs (LocalAuthentication on iOS), we may need to write deep native platform channels. |
| Security | Secure Enclave | We use the device hardware to generate the Private/Public key pair. The Private key *cannot* leave the device. |

---

## 🔐 Security Architecture (Extreme)

### The FIDO2 / WebAuthn Flow
| Step | Implementation |
|---------|---------------|
| 1. Enrollment | CEO downloads app. App generates a Private/Public key pair inside the Secure Enclave. App sends the Public Key to Go backend. |
| 2. The Challenge | Treasury initiates a $5M wire. Go backend generates a cryptographic `challenge` string and pushes it to the CEO's phone. |
| 3. FaceID | iOS asks for CEO's face. If valid, iOS allows the Private Key to sign the `challenge`. |
| 4. Verification | Phone sends the signed challenge back to Go. Go verifies it using the stored Public Key. Wire is released. |

### The "Silent Alarm" Duress Code
| Measure | Implementation |
|---------|---------------|
| Finger Mapping | During enrollment, the CEO registers their Right Thumb as "Approve" and their Left Index Finger as "Duress". |
| Fake Approval | If coerced by an attacker, they use the Left Index finger. The device signs the challenge with a *different* private key. |
| Escrow Routing | The backend receives the Duress signature. It sends an "HTTP 200 OK" to the attacker's screen, but silently changes the routing number in the ERP to a frozen bank escrow account and alerts the FBI. |

---

## 📊 Integration API Design

### ERP Webhook Endpoints
```
POST   https://api.livenesslink.com/v1/transaction/initiate
Payload: 
{
  "amount": 5000000,
  "currency": "USD",
  "destination_account": "GB82WEST12345678",
  "required_quorum": ["ceo_id", "cfo_id"]
}

# The backend holds the connection open (Long Polling) or fires a webhook back to the ERP when both the CEO and CFO have cryptographically signed.
```

---

## 📈 Scaling Strategy

We are a Low-Volume, High-Value system.
- We do not need to process 10,000 requests per second.
- We might only process 500 requests a day, but those requests are worth $1 Billion.
- **Reliability > Speed**: We run multi-zone, multi-region active-active clusters in AWS. If our service goes down, the client literally cannot payroll their 10,000 employees. Uptime is critical.
