# Legal & Compliance: LivenessLink

## 🏛️ Legal Structure

### Recommended Entity Structure

| Entity              | Jurisdiction        | Purpose                             |
| ------------------- | ------------------- | ----------------------------------- |
| **Holding Company** | UK Ltd or US C-Corp | Standard venture backing structure. |

---

## 🔐 Data Privacy & Biometrics (Extreme Risk)

LivenessLink handles the most sensitive data imaginable: the biometric signatures of Fortune 500 C-Suite executives.

### Technical Measures

| Measure                       | Implementation                                                                                                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **FIDO2 / WebAuthn Standard** | Critical. We **do not store face or fingerprint data**. The FaceID authentication happens locally on the iPhone's Secure Enclave. The iPhone signs a cryptographic payload with a private key. We only store the _Public Key_. |
| Decentralized Identity        | If our servers are hacked, the attacker gets nothing but public keys. They cannot recreate the CEO's face.                                                                                                                     |
| Zero-Knowledge Proofs         | The dashboard proves the CEO signed the wire without revealing the CEO's underlying metadata.                                                                                                                                  |

### Regulatory Compliance (Biometrics)

| Standard                    | Status         | Target Date                                                                                                                    |
| --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| GDPR (Biometric processing) | 🟢 Solved      | By using FIDO2, biometric data never leaves the device, bypassing the massive GDPR hurdles of centralized biometric databases. |
| SOC 2 Type II               | ⚪ Not started | Month 6 (Mandatory to sell to banks)                                                                                           |
| ISO 27001                   | ⚪ Not started | Year 1                                                                                                                         |

---

## 🛡️ Insurance & Liability

### Legal Disclaimers

We are authorizing movements of tens of millions of pounds. If our system fails and allows a fraudulent wire, the liability could bankrupt the company instantly.

- **Contractual Caps**: Our master service agreement strictly caps liability at the cost of the software license, not the value of the wired funds.
- **Cyber Insurance**: We require £10M+ in Cyber Liability & Errors and Omissions (E&O) insurance from day one.
