# Legal & Compliance: Structura (Construction Invoicing)

## 🏛️ Legal Structure

### Recommended Entity Structure

| Entity           | Jurisdiction | Purpose                                                                                                                  |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Operating Co** | UK / US      | Standard operating entity.                                                                                               |
| **FinTech SPV**  | Separate     | If we engage in invoice factoring (lending money), we need a bankruptcy-remote Special Purpose Vehicle to hold the debt. |

---

## 🔐 Regulatory Compliance (FinTech)

Because we are facilitating B2B payments and potentially offering "Early Pay" (Factoring/Lending), we enter heavy financial regulation.

### Banking Regulations

| Requirement                 | Status      | Implementation                                                                                                                                                 |
| --------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti-Money Laundering (AML) | Required    | We must integrate Onfido or Stripe Identity into the onboarding flow. You cannot pay a subcontractor without verifying their corporate identity.               |
| PSD2 / Open Banking         | Required    | To facilitate Account-to-Account (A2A) transfers cheaply, we will partner with Plaid or TrueLayer to bypass credit card fees.                                  |
| Lending Licenses            | Avoid using | We do not want a lending license in Year 1. We will partner with a "Bank Sponsor" (e.g., Cross River Bank) to handle the actual money movement and compliance. |

---

## 📜 Construction Law & Mechanics Liens

### The "Lien Waiver" Checkpoint

In construction, when a subcontractor is paid, they must sign a legal "Lien Waiver" promising they won't sue the General Contractor for that portion of the work.

- **Implementation**: Our platform cannot simply release funds. We must intercept the payment, digitally generate the Lien Waiver, force the subcontractor to e-sign it (via DocuSign API), and _then_ release the funds. This is a massive legal moat.

---

## 🛡️ Insurance & Liability

### Required Coverage

| Type            | Coverage | Why                                                                                |
| --------------- | -------- | ---------------------------------------------------------------------------------- |
| Cyber Liability | £2M      | If a hacker changes the routing numbers and a £5M concrete invoice goes to Russia. |
| General E&O     | £1M      | Standard software failure coverage.                                                |
