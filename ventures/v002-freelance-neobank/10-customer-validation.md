# Customer Validation: SoloFi (Freelance Neobank)

## 🎯 Validation Status

| Stage               | Status         | Date   |
| ------------------- | -------------- | ------ |
| Problem Discovery   | 🟢 Completed   | [DATE] |
| Solution Validation | 🟢 Completed   | [DATE] |
| Pricing Validation  | 🟡 In Progress | [DATE] |

---

## 🔍 Problem Discovery

### Interviews Conducted

| #   | Date   | Persona           | Company      | Key Insight                                                                                                                                                                 |
| --- | ------ | ----------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Aug 10 | Graphic Designer  | Sole Trader  | "Tax season ruins my life. I never save enough because my business income and personal groceries all happen in one Chase checking account."                                 |
| 2   | Aug 12 | Software Engineer | LLC / Ltd Co | "I tried to get a mortgage. The bank looked at my 1099/contractor income and laughed. They don't understand that I make more than a salaried worker."                       |
| 3   | Aug 15 | Copywriter        | Sole Trader  | "I use 4 different apps: Monzo for banking, Quickbooks for tracking, Stripe for invoices, and an accountant. It costs me £150 a month and none of them talk to each other." |

### Pain Point Severity

| Pain Point                   | Severity (1-10) | Frequency | Evidence                                                                                  |
| ---------------------------- | --------------- | --------- | ----------------------------------------------------------------------------------------- |
| Commingled Funds             | 10/10           | Daily     | Over 60% of new freelancers use personal accounts for business, risking tax audits.       |
| The "January Tax Bill Panic" | 9/10            | Annually  | Massive spike in personal loans happens every January to cover unexpected tax shortfalls. |

---

## 💡 Solution Validation

### Demo Feedback (Using Figma Mockups)

| #   | Date   | Interviewee  | Reaction    | Feedback                                                                                                               |
| --- | ------ | ------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Aug 18 | Designer     | 🟢 Euphoric | "If the bank automatically scoops 20% of every inbound payment into a hidden 'Tax Vault', I would switch banks today." |
| 2   | Aug 19 | Software Eng | 🟡 Cautious | "I like the invoicing feature, but I won't move my direct deposits unless you offer FDIC/FSCS insurance."              |

---

## ✅ Validation Summary

### Key Findings

1. **Automation is the Product**: Freelancers don't want a "bank". They want a financial assistant. The Auto-Tax Vault is the "killer feature" that drives acquisition.
2. **Trust is Mandatory**: We cannot launch as a "pre-paid card". It must be a full-fledged account with deposit insurance (via a partner bank) or nobody will deposit their actual income.

### Pivots Required

| Area       | Current       | Proposed          | Reason                                                                                                                                                                                  |
| ---------- | ------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounting | Build our own | Partner/Integrate | Initially planned to build accounting software. Pivoted to simply categorized transactions and pushing them cleanly to Xero/Quickbooks. We are the _data source_, not the _end ledger_. |
