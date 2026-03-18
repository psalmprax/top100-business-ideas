# Legal & Compliance: SoloFi (Freelance Neobank)

## 🏛️ Legal Structure & Banking Charter

### We Are Not A Bank
It takes £20M and 3 years to get a full banking charter. We will launch as a **"Managed Service Provider"** running on top of a Banking-as-a-Service (BaaS) infrastructure.

| Partner Layer | Provider Options | Purpose |
|---------------|------------------|---------|
| **Core Banking Ledger** | ClearBank (UK) / Cross River (US) | Provides the actual sort-codes, account numbers, and FDIC/FSCS deposit insurance. |
| **Card Issuing** | Stripe Issuing / Marqeta | Prints the physical Mastercards and handles Apple Pay tokenization. |
| **Our App (SoloFi)** | Us | The frontend UI, the AI tax logic, the customer support. |

---

## 🔐 Regulatory Compliance (Strict)

Because we hold consumer/SMB funds, we face intense scrutiny from the FCA (UK) or CFPB (US).

### Mandatory Identity Protocols
| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Anti-Money Laundering (AML)| Required | We are legally on the hook if terrorists use our app to move money. We must block accounts instantly if suspicious patterns emerge. |
| Know Your Customer (KYC)| Required | **Stripe Identity** integration during onboarding. User must take a selfie and snap a photo of their passport. |
| Sanctions Screening | Required | Every account creation is checked against OFAC / Interpol watchlists before the account is opened. |

---

## 📜 Marketing & Communication Law

### The "B-Word" Rule
**Critical Legal Risk**: We cannot use the word "Bank" in our marketing.
- **Illegal**: "Open a SoloFi Bank Account." (Carries massive regulatory fines).
- **Legal**: "Open a SoloFi Business Account, provided by ClearBank Ltd."
- **Implementation**: Every footer of every email, website, and app screen must contain the legal disclaimer: *"SoloFi is a financial technology company, not a bank. Banking services provided by X Bank, Member FDIC/FSCS."*

---

## 🛡️ Tax & Financial Advice Liability

### Safe Harbor Disclaimers
Our core feature is the "Auto-Tax Vault." We estimate taxes and put money aside.
- **Risk**: If we estimate 20%, and the user owes 30%, they will try to sue us for the shortfall.
- **Disclaimer**: Aggressive UX pop-ups stating: *"SoloFi AI provides estimates based on standard tier rates. This is not professional tax advice. Always consult a certified CPA. SoloFi is not liable for tax shortfalls."*
