# Technical Architecture: MediParse (Medical Coding AI)

## 🏗️ System Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
|                      HOSPITAL SYSTEM                        |
|  [Epic / Cerner EHR] ←→ [SMART on FHIR API Wrapper]         |
└─────────────────────────────────────────────────────────────┘
  ↓ (Pushes anonymized HL7/FHIR clinical notes via VPN)
┌─────────────────────────────────────────────────────────────┐
|                    MEDIPARSE CLOUD (AWS/AZURE)              |
|  [Ingestion / De-ID] → [Vector DB] → [RAG / Logic Engine]   |
└─────────────────────────────────────────────────────────────┘
  ↓ (Query)                                  ↑ (Grounding)
┌────────────┐                         ┌──────────────────────┐
| Azure      |                         | Clinical Guidelines  |
| OpenAI API |                         | (ICD-10 / CPT Rules) |
└────────────┘                         └──────────────────────┘
```

---

## 🔧 Tech Stack

### Data Pipeline (The "Plumbing")
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Ingestion API | Python (FastAPI) | Excellent support for HL7/FHIR parsing libraries. |
| EHR Integration | Redox Engine or native Epic App Orchard | We do not want to build custom VPN tunnels for every hospital. We use a unified API layer like Redox if possible. |
| De-Identification | AWS Comprehend Medical | Scrubs Patient Names, SSNs, and Dates of Birth *before* the text hits the core LLM processing queue. |

### The Brain (The Inference Layer)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Knowledge Base | Pinecone / Milvus | Vector database storing the 15,000+ ICD-10 rules and historical edge cases. |
| The LLM | Azure OpenAI (GPT-4o) | **Absolute requirement.** Microsoft signs BAAs for Azure. Standard OpenAI API does not meet enterprise hospital security thresholds. |
| Framework | LlamaIndex / LangChain | Custom prompting pipeline: `Extract Diagnoses -> Vector Search ICD-10 Rule -> Format Output -> Cite Evidence`. |

### The Dashboard (The "Human Validator")
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Web Framework | Next.js | Server-side rendering is faster for incredibly dense text interfaces. |
| UI/UX | Tailwind + Shadcn | Minimalist, high-contrast, designed for medical coders who look at screens for 10 hours a day. |

---

## 🔐 Security Architecture (Extreme)

### "Legacy-Safe" Philosophy
| Measure | Implementation |
|---------|---------------|
| **Edge Agent** | For on-prem EHRs (Legacy Epic instances), we deploy a lightweight Go binary inside the hospital DMZ. It performs De-ID locally before tunneling encrypted metadata to our cloud. |
| Dedicated Tenancy | Enterprise hospitals demand single-tenant architecture. We run separate AWS VPCs/Clusters for each major hospital system so their patient data never mingles in the same database. |
| Zero Training Loop| We explicitly guarantee that Client A's patient charts will *never* be used to fine-tune the master model. |
| Audit Logging | Every single click, login, and API request is logged to an immutable append-only datastore (AWS CloudTrail / QLDB) for HIPAA audit purposes. |

---

## 📈 Scaling Strategy

### The "Overnight" Problem
Hospitals operate 24/7, but the bulk of charts are finalized at the end of physician shifts.
| Target | Strategy |
|--------|----------|
| Batch Processing Engine | The AI does not need to return a code in 500 milliseconds (like a chatbot). We have an SLA of 2 hours. We use Kafka/Celery queues to smooth out spikes in Azure OpenAI rate limits. |
| Cost Control | We utilize smaller, fine-tuned open-source models (Llama 3 8B) for easy tasks (e.g., standard Radiology X-Rays) and route only complex 100-page complex ICU charts to GPT-4o. |
