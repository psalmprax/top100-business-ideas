# Product Feature Roadmap: MediParse (Medical Coding AI)

## 🎯 Feature Prioritization Framework

### RICE Scoring Example
| Feature | Reach | Impact | Confidence | Effort (Wks) | Score |
|--------|--------|-------------|-----------|-------|-------|
| Epic SMART on FHIR App | 100% | 3.0 | 90% | 8 | **33.7** |
| Evidence Highlighting UI | 100% | 3.0 | 90% | 4 | **67.5** |
| Azure OpenAI HIPAA Setup | 100% | 3.0 | 100%| 4 | **75.0** (Must Do) |

---

## 📅 Feature Roadmap

### Q1: MVP (Single Specialty Pilot)
**Focus**: Proving the model works on a narrow, high-volume slice of medicine (e.g., Radiology or Emergency Room).
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **HIPAA Azure Pipeline** | 🔄 In Progress | DevOps | Zero-retention secure enclave for processing PHi. |
| **Payer Rules Vector DB** | 🟡 Planned | AI Eng | Absorbing all Medicare and BlueCross coding manuals. |
| **Evidence UI Dashboard** | ⚪ Planned | Frontend | Split-screen view: Doctor's note on left, suggested code on right. |
| **Radiology Fine-Tuning** | ⚪ Planned | AI Eng | Achieving 95% accuracy on X-Ray/MRI parsing. |

### Q2: Growth (The "Epic Embed")
**Focus**: Removing the need for double-entry by launching directly inside the hospital's EHR.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **HL7/FHIR Ingestion** | ⚪ Backlog | Backend | Pulling finalized physician notes automatically hourly. |
| **Write-Back API** | ⚪ Backlog | Backend | Sending the AI-suggested code back into the Epic billing module. |
| **Inpatient/ICU Coding** | ⚪ Backlog | ML Ops | Expanding from simple radiology to complex 50-page hospital stays. |

### Q3: Scale (The "Denial Prevention" Engine)
**Focus**: Moving from *speed* to *revenue capture*.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Clinical Documentation Improvement (CDI)** | ⚪ Backlog | AI Eng | AI flags the *Doctor* before they sign the chart: "You wrote 'Heart Failure', please specify 'Acute' or 'Chronic' so we can bill it." |
| **Pre-Bill Auditor** | ⚪ Backlog | Backend | Simulating an insurance company rejection before the claim is sent. |

### Q4: Enterprise Operations
**Focus**: Multi-hospital rollouts and advanced analytics for the CRO.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Physician Education Dashboard** | ⚪ Backlog | Frontend | Showing the CFO which specific doctors have the worst documentation habits causing revenue leaks. |
| **Local LLM Deployment** | ⚪ Backlog | DevOps | Exploring putting Llama 3 on physical GPU servers inside the hospital basement for paranoid clients. |

---

## 📦 MVP Feature List (Must Haves - P0)

| Feature | Description | Why |
|---------|-------------|-----|
| Quote Citation | The AI must highlight the exact text in the chart that triggered the code. | Trust. A human coder will not accept an AI's advice unless they can verify the source in 2 seconds. |
| De-Identification | Stripping PII before it hits the LLM. | Even with a BAA in place, minimizing the surface area of PHI transmission is critical for InfoSec approval. |
| "Low Confidence" Flag | If the AI is only 70% sure, it routes the chart to the Senior Human Auditor. | Graceful degradation. We don't guess in healthcare. |
