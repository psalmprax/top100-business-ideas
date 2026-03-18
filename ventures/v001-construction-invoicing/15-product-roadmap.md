# Product Feature Roadmap: Structura (Construction Invoicing)

## 🎯 Feature Prioritization Framework

### RICE Scoring Example
| Feature | Reach | Impact | Confidence | Effort (Wks) | Score |
|--------|--------|-------------|-----------|-------|-------|
| VLM Invoice Parsing | 100% | 3.0 | 90% | 4 | **67.5** |
| Procore API Integration | 80% | 3.0 | 80% | 5 | **38.4** |
| "Early Pay" FinTech Rail | 40% | 3.0 | 70% | 8 | **10.5** (Deferred to Q3) |

---

## 📅 Feature Roadmap

### Q1: MVP (The "Admin Eliminator")
**Focus**: Prove we can turn a terrible PDF into perfect JSON data and save the General Contractor 10 hours a week.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **PDF Extraction Engine** | 🔄 In Progress | AI Eng | Async pipeline passing PDFs to GPT-4o-Vision and returning structured line items. |
| **GC Triage Dashboard** | 🟡 Planned | Frontend | Kanban-style board for invoices: "Pending Audit", "Discrepancy", "Approved". |
| **Line-Item Matcher** | ⚪ Planned | Backend | Script comparing the extracted invoice items against the uploaded contract CSV. |

### Q2: Growth (The "Workflow Embed")
**Focus**: Integrating directly into the tools the construction companies already use.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Procore Marketplace App**| ⚪ Backlog | Eng | Pushing approved invoices directly into the GC's Procore ledger. |
| **Automated Lien Waivers** | ⚪ Backlog | Backend | Generating a PDF via API that forces the Subcontractor to sign digitally. |
| **Subcontractor Portal** | ⚪ Backlog | Frontend | A lightweight mobile-friendly view where subs can upload their invoices. |

### Q3: Scale (The "FinTech Wedge")
**Focus**: Activating the massive revenue driver: B2B Factoring / Early Payments.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Plaid Integration** | ⚪ Backlog | Eng | Subcontractors KYC and link their bank accounts to receive funds. |
| **The "Early Pay" Button** | ⚪ Backlog | FinTech | Allowing the sub to take a 2% haircut to get paid in 48 hours. |
| **Risk Scoring Engine** | ⚪ Backlog | Data Sci | Assessing the creditworthiness of the GC before we advance funds to the Sub. |

### Q4: Enterprise Operations
**Focus**: Expanding payment optionality and enterprise compliance.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Virtual Credit Cards (vCards)**| ⚪ Backlog | FinTech | Paying subs via generated credit card numbers to capture interchange fees. |
| **Sage / QuickBooks Sync** | ⚪ Backlog | Eng | Expanding beyond Procore to native accounting syncs. |

---

## 📦 MVP Feature List (Must Haves - P0)

| Feature | Description | Why |
|---------|-------------|-----|
| Unstructured PDF Intake | A simple email address (`invoices@structura.build`) where subs can email PDFs directly. | Subs will not log into a portal. We must accept their current behavior (emailing attachments). |
| The Audit Diff | UI showing *exactly* where the invoice mathematics fail or don't match the contract. | The primary reason the GC buys the software. |
| Procore Export | 1-click push to Procore. | If they have to copy-paste the data out of our app, we lose. |
