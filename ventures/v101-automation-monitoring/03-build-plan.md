# Build Plan: AutoSentinel Infrastructure

## 🛠️ Tech Stack
- **Backend**: Node.js (Express) for webhook processing.
- **Database**: PostgreSQL for workflow metadata + Redis for real-time state.
- **Queue**: BullMQ for handling high-volume automation events.
- **Frontend**: React + Tailwind for dashboard.

## 📋 MVP Core Requirements
1.  **Webhook Receiver**: Accept incoming events from Zapier/Make/n8n webhooks.
2.  **Status Engine**: Track success/failure states per workflow run.
3.  **Alert Dispatcher**: Send notifications via Email and Slack webhooks.
4.  **Basic Dashboard**: Show workflow health at a glance.

## 📦 Key Deliverables
- [ ] AutoSentinel Dashboard (Web).
- [ ] Zapier/Make/n8n integration (outgoing webhooks).
- [ ] Slack notification app.
- [ ] Status page generator.
