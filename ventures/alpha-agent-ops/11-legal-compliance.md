# Legal & Compliance: Agent Ops Sentinel

## 🏛️ Legal Structure

### Recommended Entity Structure

| Entity              | Jurisdiction       | Purpose                                                    |
| ------------------- | ------------------ | ---------------------------------------------------------- |
| **Holding Company** | US Delaware C-Corp | YC/VC fundraising standard, standard IP assignment.        |
| **Operating Co**    | UK Ltd             | If founders are UK based, for R&D tax credits and payroll. |

---

## 🔐 Data Privacy & Security (Critical for proxy)

Because Sentinel acts as a "Man in the Middle" between the client's servers and OpenAI/Anthropic, security is the entire business.

### Technical Measures

| Measure            | Implementation                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Zero-Logging Mode  | Sentinel evaluates rules in-memory and drops the payload. Logs only metadata (Token count, timestamp, pass/fail).                          |
| Bring Your Own Key | Clients maintain their own OpenAI API keys. Sentinel encrypts them at rest with HashiCorp Vault.                                           |
| VPC Deployment     | Enterprise clients can deploy the Sentinel proxy data-plane inside their own AWS/GCP VPC. Only metrics are sent back to our control plane. |

### Compliance Certification

| Standard      | Status         | Target Date                                                      |
| ------------- | -------------- | ---------------------------------------------------------------- |
| SOC 2 Type I  | ⚪ Not started | Month 6 (Needed to close mid-market)                             |
| SOC 2 Type II | ⚪ Not started | Year 1.5                                                         |
| GDPR          | 🟡 In Design   | Zero-PII logging ensures we aren't a data processor of raw text. |

---

## 📜 Intellectual Property

### Protection Strategy

1. **Core Open Source**: The basic proxy logic will be open-sourced (MIT or Apache 2.0) to drive developer adoption.
2. **Proprietary Logic**: The "Semantic Loop Detection" models and the "Enterprise Control Plane" dashboard are closed-source.
3. **Trademarks**: File for "Agent Ops Sentinel" in US/UK.
