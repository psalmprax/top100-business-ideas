# Technical Architecture: Structura (Construction Invoicing)

## 🏗️ System Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
|                      GENERAL CONTRACTOR                     |
|  [Procore Sync] ←→ [Structura Dashboard (Next.js/React)]    |
└─────────────────────────────────────────────────────────────┘
                            ↓ (Contract & Approved Invoice Data)
┌─────────────────────────────────────────────────────────────┐
|                 STRUCTURA CORE (NODE/PYTHON)                |
|  [VLM OCR Engine] ←→ [Ledger / Smart Contract Engine]       |
└─────────────────────────────────────────────────────────────┘
  ↓ (API: Generate Lien Waiver)             ↓ (API: Early Pay Request)
┌────────────┐                         ┌──────────────────────┐
| DocuSign   |                         |  Banking-as-a-Service|
| (E-Sign)   |                         |  (Stripe/Cross River)|
└────────────┘                         └──────────────────────┘
```

---

## 🔧 Tech Stack

### Data Extraction (The AI Layer)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Processing | Python / FastAPI | Standard for ML workloads. |
| Vision | OpenAI GPT-4o Vision API or Claude 3.5 Sonnet | Construction invoices are highly unstructured (photos of handwritten notes, crumpled PDFs). Only state-of-the-art VLMs can parse them reliably without massive custom templating. |

### Core Backend (The FinTech Layer)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| API Server | Node.js (NestJS) or Go | High IO concurrency for handling dashboard requests and third-party webhooks. |
| Ledger DB | PostgreSQL | Must use strict ACID transactions. Double-entry accounting system to track every penny. |

### Integrations Layer (CRITICAL)
| Component | Integration Approach | Rationale |
|-----------|----------------------|-----------|
| ERP Sync | Procore API / Sage Intacct | The GC will never use our tool if it requires double-entry into their accounting software. We must push fully audited data back into Procore. |
| E-Sign | DocuSign / HelloSign API | Mechanically required to generate and sign Lien Waivers before releasing funds. |

---

## 🔐 Security & Compliance Architecture

### Payment Handling
| Measure | Implementation |
|---------|---------------|
| **No Direct PII Storage** | Subcontractors link their bank accounts via **Plaid**. We never see or store their actual account routing numbers, drastically reducing our PCI compliance burden. |
| **Ledger Immutability** | Database tables relating to `transactions_log` are append-only. No `UPDATE` or `DELETE` statements are allowed in the ORM for financial records. |
| **Separation of Duties** | The AI parsing engine runs in a completely separate microservice/VPC from the FinTech payment release engine to prevent cross-contamination. |

---

## 📈 Scaling Strategy

### Handling the "Lumpy" Workload
Construction invoicing is highly cyclical. 90% of invoices are submitted on the 25th to the 30th of the month.
| Target | Strategy |
|--------|----------|
| AI Spike Management | The VLM extraction can take 10-15 seconds per PDF chapter. We do not do this synchronously. Uploads are pushed to an SQS queue, processed by auto-scaling Python workers, and the frontend is updated via WebSockets upon completion. |
