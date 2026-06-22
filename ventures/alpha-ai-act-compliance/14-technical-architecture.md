# Technical Architecture: ReguLens AI

## 🏗️ System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
|                      CLIENT ENVIRONMENT                     |
|  [GitHub Actions / GitLab CI] → runs `regu-lens-agent`      |
└─────────────────────────────────────────────────────────────┘
  ↓ (Pushes Metadata via HTTPS API)
┌─────────────────────────────────────────────────────────────┐
|                    REGULENS CLOUD (AWS EU)                  |
|  [API Gateway] → [Data Pipeline] → [Compliance Engine]      |
└─────────────────────────────────────────────────────────────┘
  ↓                                         ↓ (PDF Generation)
┌────────────┐                         ┌──────────────────────┐
| PostgreSQL |  ←  [Web Dashboard]  →  |   Document Service   |
| (Encrypted)|     (Next.js)           |   (Puppeteer/LaTeX)  |
└────────────┘                         └──────────────────────┘
```

---

## 🔧 Tech Stack

### Backend

| Component    | Technology         | Rationale                                                                                                                   |
| ------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| API Core     | Python (FastAPI)   | We need heavy Pandas/Numpy integration for the Article 10 Bias Scanner. Python is the only choice for ML metadata analysis. |
| Database     | PostgreSQL         | Relational, extremely structured reporting data.                                                                            |
| Document Gen | LaTeX or Puppeteer | Must generate pixel-perfect, highly professional legal PDFs.                                                                |

### Frontend

| Component        | Technology        | Rationale                                                    |
| ---------------- | ----------------- | ------------------------------------------------------------ |
| Web Framework    | Next.js 14        | Rapid development of static and dynamic forms.               |
| State Management | Zustand           | Simple global state for multi-page complex compliance forms. |
| UI Components    | Tailwind + Shadcn | Clean, corporate, trustworthy aesthetic.                     |

### Infrastructure (CRITICAL)

| Component      | Technology                   | Purpose                                                                                               |
| -------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Cloud Provider | AWS (eu-central-1 Frankfurt) | **Absolute Data Residency**. No data can ever hit a US server due to Schrems II and Enterprise fears. |
| Encryption     | AWS KMS                      | Key management for at-rest encryption of all client metadata.                                         |

---

## 🔐 Security Architecture

### "Zero-Code" Philosophy

| Measure             | Implementation                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client-Side Agent   | We provide an open-source bash script/Docker container. The client runs it inside their _own_ CI/CD pipeline (GitHub Actions).                                   |
| Metadata Extraction | The agent purely reads `requirements.txt`, counts layers in a PyTorch model, and parses dataset column names. It does **not** read source code or raw data rows. |
| Push-Only API       | The agent pushes the anonymized JSON payload to our API. We require no inbound access to the client's servers.                                                   |

---

## 📊 API Design

### Agent Intake Endpoint

```
POST   https://api.eu.regulens.com/v1/telemetry/intake
Headers:
  Authorization: Bearer <CLIENT_API_KEY>
Payload:
{
  "model_name": "resume-sorter-v2",
  "framework": "PyTorch",
  "parameter_count": 1.5e9,
  "dataset_metadata": { "columns": ["age", "gender", "score"], "rows": 100000 }
}
```

---

## 📈 Scaling Strategy

### Complexity vs Scale

We do not have a "high throughput" scale problem (like Agent Ops). We have a **"High Complexity"** scale problem.
| Target | Strategy |
|--------|----------|
| Multi-Page State | Users will take 30 days to fill out an Annex IV form, saving and returning. We scale our PostgreSQL instance vertically and use aggressive autosave throttling. |
| Document Rendering | PDF generation is CPU intensive. We will run an async worker queue (Celery/Redis) to offload PDF generation from the main web cluster. |
