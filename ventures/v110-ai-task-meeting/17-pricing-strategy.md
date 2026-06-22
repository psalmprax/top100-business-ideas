# Pricing Strategy: TaskFlow AI

## 💰 Pricing Philosophy

### Core Principles

1. **The "Shadow Work" Tax**: We anchor our price against the 2-4 hours a week managers spend on post-meeting admin. We save them $500/mo in executive time.
2. **Action over Transcription**: We don't charge for "minutes of audio" (like Otter). We charge for **Actionable Results**.
3. **Frictionless Onboarding**: Single-user free tier to get "virality" within companies before the "Team" upgrade.

---

## 📊 Pricing Tiers

### Current Pricing

| Tier           | Price       | Features                                | Target                      |
| -------------- | ----------- | --------------------------------------- | --------------------------- |
| **Personal**   | Free        | 3 Meetings/mo, basic task summary.      | Individual contributors.    |
| **Pro**        | $15/mo      | Unlimited meetings, 10+ integrations.   | Power users / PMs.          |
| **Team**       | $29/user    | Shared Team Dashboard, Multi-Org Tasks. | Lead Developers / Managers. |
| **Enterprise** | $0.10 / min | Dedicated GPU, On-prem, Custom SLA.     | Fortune 500 / Gov.          |

---

## 💵 Unit Economics

### Margin Analysis

| Cost Type      | Est. Cost per 60-min Meeting | Rationale                                  |
| -------------- | ---------------------------- | ------------------------------------------ |
| Transcription  | $0.06                        | Running Whisper-v3 on private GPU cluster. |
| Extraction     | $0.02                        | GPT-4o-mini API calls.                     |
| **Total COGS** | **$0.08**                    |                                            |

**Gross Margin on Pro Tier**: Assuming 20 meetings per month, COGS = $1.60. Revenue = $15.00. **Margin = 89%**.

---

## 🎯 Pricing Psychology

### Objection Handling

- **"We already have Otter/Fireflies."**
  - **Rebuttal**: "Otter gives you a book to read. TaskFlow gives you a task list to finish. We reduce 'Meeting Debt' by 70% compared to simple transcription tools."

---

## 📈 Competitor Pricing

| Competitor     | Pricing Model | Differentiation                              |
| -------------- | ------------- | -------------------------------------------- |
| **Otter.ai**   | $16.99/mo     | Focuses on search/chat with transcripts.     |
| **Fellow.app** | $7.00/user    | Manual agenda focus (no auto-AI extraction). |
| **TaskFlow**   | **$15.00/mo** | **Autonomous Task Extraction & Sync.**       |
