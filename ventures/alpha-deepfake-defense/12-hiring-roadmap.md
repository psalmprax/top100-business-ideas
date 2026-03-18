# Hiring Roadmap: LivenessLink

## 🎯 Hiring Philosophy

### Core Values
1. **Paranoia as a Feature** - We assume every network, device, and human is compromised. We code defensively.
2. **Cryptographic Rigor** - We don't roll our own crypto. We strictly adhere to FIDO2, WebAuthn, and NIST standards.
3. **Enterprise Empathy** - We understand that selling an app to a 60-year-old CFO means the UX must be absolutely flawless and instantaneous.

### First 5 Hires
| Priority | Role | Impact | Timing |
|----------|------|--------|--------|
| 1 | Applied Cryptographer / Backend | Building the WebAuthn public key directory and FIDO2 integration. | Month 1 |
| 2 | Senior Flutter / iOS Dev | Building the ultra-secure biometric mobile application (the "Token"). | Month 2 |
| 3 | Enterprise AE (FinServ) | Someone who has sold into Treasuries or CFO suites at mid-market corps. | Month 4 |
| 4 | Security / Pen-Tester | A dedicated White-Hat to constantly try and break the authentication loop. | Month 5 |
| 5 | ERP Integration Eng | To build the bespoke connectors for Sage, Oracle, and Kyriba. | Month 7 |

---

## 👥 Role Specifications

### Role: Applied Cryptographer
**Department**: Engineering

**Responsibilities**:
- Own the implementation of the passwordless FIDO2 protocol.
- Secure the backend Go/Rust APIs against replay attacks, timing attacks, and MITM.
- Design the multi-sig "quorum" logic (e.g., 2 out of 3 board members must sign).

**Requirements**:
- Deep understanding of public key infrastructure (PKI), ECDSA, and Hardware Security Modules (HSMs).
- Previous experience in FinTech, banking security, or identity (e.g., Okta, Auth0).

---

## 🎁 Compensation Framework

### Salary Bands (Targeting Security Tier-1 Talent)
| Level | Engineering | Pen-Tester | Sales (OTE) |
|-------|------------|-----------|--------------|
| Senior | £100k - £130k | £90k - £120k | £140k OTE |
| Principal| £140k - £180k | N/A | £180k OTE |

*(Note: Security/Crypto engineers demand a massive premium over standard full-stack web developers).*
