# Customer Validation: LivenessLink

## 🎯 Validation Status

| Stage | Status | Date |
|-------|--------|------|
| Problem Discovery | 🟢 Completed | [DATE] |
| Solution Validation | 🟡 In Progress| [DATE] |
| Pricing Validation | ⚪ Not Started | - |

---

## 🔍 Problem Discovery

### Interviews Conducted
| # | Date | Persona | Company | Key Insight |
|---|------|---------|---------|-------------|
| 1 | Aug 10 | CFO | Mid-market Manufacturing | "I got a frantic call from our VP of Finance saying the CEO told him to wire $1M. It sounded EXACTLY like our CEO. We almost sent it. I haven't slept since." |
| 2 | Aug 12 | Corporate Treasurer | PE Fund | "Phishing is old news. Business Email Compromise (BEC) combined with deepfake video on Zoom means we have zero ultimate trust in any communication channel." |
| 3 | Aug 15 | Head of InfoSec | Global Retailer | "We tried one of those 'Deepfake Detection' tools. It threw false positives 20% of the time. You can't delay a $10M vendor payment because an AI guessed the video was fake." |

### Pain Point Severity
| Pain Point | Severity (1-10) | Frequency | Evidence |
|------------|------------------|-----------|----------|
| Total Loss of Trust Networks| 10/10 | Looming | $1.56B lost to deepfake fraud in 2025. |
| The "Hong Kong Scenario" | 10/10 | Rare but Fatal | A finance worker wired $25M to scammers after a Zoom call with their deepfaked "CFO". |

---

## 💡 Solution Validation

### Feature Requests
| Feature | # of Requests | Priority |
|---------|----------------|----------|
| Integration with Kyriba | 8/10 | Must-have |
| Multi-Sig Board Approval | 9/10 | Must-have |
| "Duress" Mode (Silent Alarm)| 6/10 | Should-have |
| No In-Browser Auth (Mobile Only)| 10/10 | Must-have (Browsers are compromised) |

---

## ✅ Validation Summary

### Key Findings
1. **Zero Trust is the only way**: Treasurers do not want "AI Detection". Detection is an arms race the defenders will lose. They want a **Cryptographic Hardware Signature**. The fact that our software uses iOS FaceID Secure Enclaves *bypasses* the deepfake problem entirely.
2. **Friction is a Feature, not a Bug**: In consumer software, 2-factor auth is annoying. In Treasury, when moving £10M, adding a 10-second biometric block feeling "heavy and secure" is seen as a massive positive.

### Pivots Required
| Area | Current | Proposed | Reason |
|------|---------|----------|--------|
| Authenticator| React Web App | Native iOS/Android App | CFOs demanded we use Apple's Secure Enclave for hardware-level cryptography. A web-app can be spoofed by a browser extension. |
