# Build Plan: Constructiv Infrastructure

## 🛠️ Tech Stack
- **Frontend**: React Native (Field teams need mobile).
- **Backend**: Python (FastAPI) for OCR and document generation.
- **AI/ML**: AWS Textract (for SOV parsing) + LLM for "Field Note" to "Line Item" mapping.
- **Database**: PostgreSQL with PostGIS (for GIS-tagging of site progress photos).

## 📋 MVP Core Requirements
1.  **Form Engine**: A pixel-perfect PDF generator for AIA G702/G703 standards.
2.  **SOV Parser**: AI tool to upload an existing Excel SOV and map it to the digital dashboard.
3.  **Lien Library**: A database of current state-law compliant lien waiver templates.

## 📦 Key Deliverables
- [ ] Subcontractor Mobile App.
- [ ] Automated G702 PDF Generator.
- [ ] Digital Lien Waiver e-sign module.
