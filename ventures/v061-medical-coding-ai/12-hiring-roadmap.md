# Hiring Roadmap: MediParse (Medical Coding AI)

## 🎯 Hiring Philosophy

### Core Values
1. **Clinical Rigor** - We are dealing with patient health histories. "Hallucinations" are not funny errors; they are Medicare fraud risks. Precision is everything.
2. **Enterprise Empathy** - Hospital IT moves slowly. We don't get frustrated by 6-month security reviews; we build automated compliance documentation to speed them up.
3. **Evidence-Based AI** - We do not trust black-box LLM outputs. Every AI decision must be grounded in cited evidence from the patient chart.

### First 5 Hires
| Priority | Role | Impact | Timing |
|----------|------|--------|--------|
| 1 | Senior NLP / AI Engineer | Prompt engineering, fine-tuning, and Retrieval-Augmented Generation (RAG) architecture for clinical text. | Month 1 |
| 2 | Medical SME (Part-Time) | A certified professional coder (CPC) or Doctor to audit the AI's output and write test cases. | Month 1 |
| 3 | Healthcare Integration Eng | Building the HL7 / FHIR APIs to extract data from Epic and Cerner. | Month 3 |
| 4 | Enterprise AE (Healthcare) | Someone who has successfully sold £100k+ deals to Hospital Chief Revenue Officers. | Month 4 |
| 5 | Compliance / Security Officer | To manage the brutal HITRUST certification and answer 300-question IT security surveys. | Month 5 |

---

## 👥 Role Specifications

### Role: Healthcare Integration Engineer
**Department**: Engineering

**Responsibilities**:
- Own the data ingestion pipelines.
- Transform raw, unstructured HL7 v2 messages and FHIR bundles into clean JSON for the AI pipeline.
- Build the "write-back" APIs to push the finalized codes back into Epic.

**Requirements**:
- Deep, painful experience with healthcare interoperability standards (HL7, FHIR, CDA).
- Familiarity with Mirth Connect or similar integration engines.

---

## 🎁 Compensation Framework

### Salary Bands 
| Level | NLP/AI Eng | Integration Eng | Sales (OTE) |
|-------|------------|-----------------|-------------|
| Senior | £100k - £130k | £85k - £110k | £150k OTE |

*(Note: Selling into hospitals requires highly experienced account executives. Base salaries for these AEs are often £80k+ before commission).*
