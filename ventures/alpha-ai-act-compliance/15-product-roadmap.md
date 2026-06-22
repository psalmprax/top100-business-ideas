# Product Feature Roadmap: ReguLens AI

## 🎯 Feature Prioritization Framework

### RICE Scoring Example

| Feature                 | Reach | Impact | Confidence | Effort (Wks) | Score    |
| ----------------------- | ----- | ------ | ---------- | ------------ | -------- |
| Annex IV PDF Generator  | 100%  | 3.0    | 90%        | 6            | **45.0** |
| CI/CD Metadata Agent    | 70%   | 2.5    | 80%        | 4            | **35.0** |
| Article 10 Bias Scanner | 50%   | 2.0    | 70%        | 5            | **14.0** |

---

## 📅 Feature Roadmap

### Q1: MVP (The "Paperwork Automator")

**Focus**: Proving we can replace the €50k consulting fee with software.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Dynamic Compliance Form** | 🔄 In Progress | Frontend | A massive, branching questionnaire mapping to the EU AI Act text. |
| **PDF Generation Engine** | 🟡 Planned | Backend | Compiles the form answers into a legally formatted Annex IV Document. |
| **Role-Based Access Control**| ⚪ Planned | Fullstack | The DPO views the dashboard, the Engineer fills out the tech fields. |

### Q2: Growth (The "CI/CD Connection")

**Focus**: Differentiating from basic "Checklist" software (like OneTrust) by adding deep technical automation.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **GitHub Actions Agent** | ⚪ Backlog | DevOps | Open-source agent that scans a repository and pushes architecture metadata. |
| **HuggingFace Integration** | ⚪ Backlog | Backend | Pull model cards automatically via API instead of manual entry. |
| **Post-Market Surveillance** | ⚪ Backlog | Backend | A daily API ping that asks the client's servers if the model has drifted. |

### Q3: Scale (The "Bias Scanner")

**Focus**: Tackling Article 10 (Data Governance) requirements.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **DataFrame Metadata Extractor**| ⚪ Backlog | Data Sci | Client-side script that generates histograms of training data (without PII). |
| **Fairness Metrics Warning** | ⚪ Backlog | Frontend | Dashboard flags if training data is 80% male, violating Article 10 diversity requirements. |
| **Adversarial Audit Bot** | ⚪ Backlog | AI Eng | LLM that quizzes the DPO to prep them for a real National Authority audit. |

### Q4: Enterprise Operations

**Focus**: Serving the massive Pan-European corporates.
| Feature | Status | Owner | Description |
|---------|--------|-------|-------------|
| **Multi-Subsidiary Rollups** | ⚪ Backlog | Fullstack | Allowing a holding company to view compliance for 50 child entities. |
| **ISO 27001 Certification** | ⚪ Backlog | Ops | Achieving the certification required to sell to EU banks. |

---

## 📦 MVP Feature List (Must Haves - P0)

| Feature             | Description                                             | Why                                                                    |
| ------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| Branching Survey UI | Form saves state, allows multiple users to collaborate. | Legal teams and Engineers must collaborate async on the same document. |
| EU Data Hosting     | AWS Frankfurt instance.                                 | Cannot sell the product without this legally guaranteed.               |
| "Export to PDF"     | Flawless document generation.                           | The literal deliverable the client is paying for.                      |
