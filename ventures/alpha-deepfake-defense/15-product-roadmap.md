# Product Feature Roadmap: LivenessLink

## 🎯 Feature Prioritization Framework

### RICE Scoring Example

| Feature                | Reach | Impact | Confidence | Effort (Wks) | Score    |
| ---------------------- | ----- | ------ | ---------- | ------------ | -------- |
| FIDO2 Secure iOS App   | 100%  | 3.0    | 90%        | 6            | **45.0** |
| Kyriba ERP Integration | 50%   | 3.0    | 80%        | 4            | **30.0** |
| Silent Duress Alarm    | 20%   | 3.0    | 70%        | 3            | **14.0** |

---

## 📅 Feature Roadmap

### Q1: MVP (The "Hardware Signer")

**Focus**: Proving the cryptographic loop. No ERP integrations yet, just a standalone portal.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Go Backend FIDO Server** | 🔄 In Progress | Backend | The core WebAuthn challenge/response engine. |
| **Native iOS Authenticator** | 🟡 Planned | Mobile | App that uses FaceID to unlock the Secure Enclave signing key. |
| **Standalone Web Dashboard** | ⚪ Planned | Frontend | A portal where a finance clerk can manually upload a wire request and click "Request CEO Signature". |

### Q2: Growth (The "ERP Wedge")

**Focus**: Embedding into the existing workflows of Treasury departments.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Kyriba API Connector** | ⚪ Backlog | Eng | Intercept wires directly inside Kyriba. |
| **Oracle NetSuite Plugin** | ⚪ Backlog | Eng | Intercept wires inside NetSuite. |
| **Multi-Sig Quorum Logic** | ⚪ Backlog | Backend | e.g. "Require 2 out of 3 Board Members to sign transfers over $1M." |

### Q3: Scale (The "Immune System")

**Focus**: Advanced security features to win the most paranoid CISOs.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **The Duress Alarm** | ⚪ Backlog | Mobile | Left-finger or specific Voice-phrase triggers an alternate private key. |
| **Geo-Fencing Approval** | ⚪ Backlog | Mobile | Cannot approve a wire if the phone's GPS is in a high-risk country. |
| **Apple Watch Integration** | ⚪ Backlog | Mobile | Tap to approve wires directly from the wrist (highly requested by CEOs). |

### Q4: Enterprise Operations

**Focus**: SOC2 and absolute auditability.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Immutable Audit Ledger**| ⚪ Backlog | Backend | Hashing the approval logs into an immutable append-only database (e.g., QLDB). |
| **SSO / SAML Identity Sink**| ⚪ Backlog | Security | Tying device enrollment directly to Azure AD / Okta identities. |

---

## 📦 MVP Feature List (Must Haves - P0)

| Feature                   | Description                                                   | Why                                                                                |
| ------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Zero-Knowledge Enrollment | The backend never sees the private key or the facial data.    | If we store biometric data, we become a massive target for hackers and GDPR fines. |
| Push Notifications        | Instant APNS delivery to the phone when a wire needs signing. | CEOs will not open an app manually to check for pending wires.                     |
| 5-Minute Timeouts         | Challenges expire quickly.                                    | Prevents replay or delayed-action attacks.                                         |
