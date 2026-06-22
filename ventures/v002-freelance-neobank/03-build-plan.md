# Build Plan: LedgerBank Infrastructure

## 🛠️ Tech Stack

- **Backend**: Node.js (NestJS) for scalable transactional logic.
- **Banking Rails**: Partner with **Railsr** or **Modulr** (BaaS) for accounts and debit cards.
- **Connectors**: Plaid/TrueLayer for Open Banking data aggregation.
- **Database**: PostgreSQL with high-integrity audit trails (ledger-style).

## 📋 MVP Core Requirements

1.  **AI Categorizer**: A model that accurately tags 95% of UK freelance expenses (Travel, Tech, Subs).
2.  **Tax Estimation Engine**: Real-time logic that applies personal allowance and tax bands (20%/40%) to the rolling profit.
3.  **HMRC API Connector**: Authenticated submission module for MTD ITSA.

## 📦 Key Deliverables

- [ ] LedgerBank Mobile App (Mobile-First).
- [ ] Automated HMRC Tax Reserve Tool.
- [ ] Digital Invoicing & VAT matching module.
