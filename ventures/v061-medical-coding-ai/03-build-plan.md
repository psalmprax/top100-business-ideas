# Build Plan: DenialDefense Infrastructure

## 🛠️ Tech Stack

- **AI/ML**: Ensemble models. Fine-tuned BioGPT or Med-PaLM for medical reasoning + specialized rules-engine for coding logic.
- **Backend**: Python (Django) due to heavy AI libraries and security maturity.
- **Infrastructure**: **HIPAA-Compliant** AWS or Azure Health. No-data-retention policy for AI model processing.
- **Browser extension**: Chrome/Edge (to overlay findings on existing EHR/EMR dashboards).

## 📋 MVP Core Requirements

1.  **Clinical Note Parser**: Extract structured medical encounters from messy doctor notes.
2.  **CPT/ICD-10 Lookup**: Up-to-date database with real-time updates for Medicare/Medicaid changes.
3.  **Risk Scorer**: A simple 1-100 "Likelihood of Payment" score for every claim.

## 📦 Key Deliverables

- [ ] Pre-Submission Audit Dashboard.
- [ ] EHR Browser Extension (Overlay).
- [ ] Automated Appeal Letter Generator.
