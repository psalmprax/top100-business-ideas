# Legal & Compliance: ReguLens AI

## 🏛️ Legal Structure

### Recommended Entity Structure

| Entity              | Jurisdiction   | Purpose                                                                                                                                                                     |
| ------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Operating Co**    | EU (GmbH / BV) | Essential. We are selling EU compliance software. Having the core data-residency and corporate shell inside the EU (Germany, Netherlands, or Ireland) builds massive trust. |
| **Holding Company** | UK / US        | Optional, depending on VC requirements.                                                                                                                                     |

---

## 🔐 Data Privacy (Strict Requirements)

Because we handle highly sensitive IP (Model parameters, training data schemas) and legal compliance status, we must be a fortress.

### Technical Measures

| Measure                        | Implementation                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| European Data Residency        | 100% of data rests in AWS eu-central-1 (Frankfurt). No data backup leaves the EEA.                                                                                        |
| ISO 27001                      | Must fast-track this certification in Year 1. EU buyers will not procure SaaS without it.                                                                                 |
| "Bring Your Own Model" Privacy | We evaluate models via API / metadata. We **never** ingest raw training data (PII) into our systems. Only column names and statistical distributions are parsed for bias. |

---

## 📜 Intellectual Property & Liability

### Legal Disclaimers (Crucial)

Because we are automating legal compliance documents, our Terms of Service must aggressively disclaim that **we are providing software, not legal counsel**.

- "The generated technical folders do not guarantee immunity from National Competent Authorities."
- We cap liability at 12 months of SaaS fees.

### Insurance Needed

| Type                   | Coverage | Premium (Est)                           |
| ---------------------- | -------- | --------------------------------------- |
| Professional Indemnity | £5M      | £15k/year (High due to compliance risk) |
| Cyber Liability        | £2M      | £5k/year                                |
