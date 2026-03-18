# Legal & Compliance: MediParse (Medical Coding AI)

## 🏛️ Legal Structure

### Regulatory Threshold
Operating in healthcare technology requires absolute adherence to the **Health Insurance Portability and Accountability Act (HIPAA)** in the US, and the **NHS Data Security and Protection Toolkit (DSPT)** in the UK.

---

## 🔐 Data Privacy (PHI Handling)

The system ingests raw clinical narratives containing patient names, social security numbers, and deep medical histories. 

### Mandatory Safeguards (The "BAA" Chain)
We must sign a legally binding **Business Associate Agreement (BAA)** with every vendor that touches our data.
| Vendor | Purpose | BAA Signed? |
|--------|---------|-------------|
| Microsoft Azure | Hosting the LLM (Azure OpenAI) | ✅ Required |
| AWS | Database / Storage | ✅ Required |
| Vercel | Frontend Dashboard | ❌ Vercel does not sign BAAs easily. We may need to self-host the frontend on AWS ECS. |

### Technical Measures
| Measure | Implementation |
|---------|----------------|
| De-identification Pipeline | Before the clinical note ever hits the AI, it passes through an AWS Comprehend Medical NER filter to strip out [NAME] and [DATE OF BIRTH]. |
| At-Rest Encryption | AES-256 for all databases. |
| Zero-Retention Agreements | Microsoft Azure must explicitly guarantee they are not retaining our API payloads to train GPT-5. |

---

## 📜 Liability & Medical Malpractice

### The "Co-Pilot" Defense
**Critical Legal Risk**: What happens if the AI suggests "Appendicitis", the human coder accepts it blindly, the insurance pays it, and then an auditor discovers the patient actually had a "Gallbladder" issue? This is Medicare Fraud.
- **Implementation**: The UI must physically force the human coder to click "I have reviewed the cited text and agree with this code." 
- **Disclaimer**: Our Terms of Service strictly state we are a "Decision Support Tool" and the hospital assumes 100% liability for final coding submissions to the government/insurers. 

---

## 🛡️ Insurance & Audits

| Requirement | Cost | Notes |
|-------------|------|-------|
| HITRUST Certification | £50,000+ | We must begin this arduous 12-month certification process immediately. Enterprise hospitals will not sign £200k SaaS contracts without HITRUST. |
| Cyber Liability Insurance | £20,000/yr| Must cover HIPAA breach fines, which can reach $1.5M per incident depending on the scale of the leak. |
