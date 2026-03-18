# Product Feature Roadmap: TaskFlow AI

## 📅 Roadmap Lifecycle

### Q1: The "Capture" Phase
**Focus**: Achieving 99% accuracy in task identity and deadline extraction.
| Feature | Status | Priority | Description |
|---------|--------|----------|-------------|
| **Whisper-v3 Pipeline** | 🔄 In Progress | P0 | Low-latency audio-to-text with speaker identification. |
| **Commitment Parser** | 🟡 Planned | P0 | Semantic Analysis to distinguish between "We should talk about X" and "I will do X." |
| **Calendar Sync v1** | ⚪ Planned | P1 | Auto-pushing extracted deadlines into Google/Outlook calendars. |

### Q2: The "Hybrid" Phase
**Focus**: Expanding beyond "Virtual Calls" into the physical office.
| Feature | Status | Priority | Description |
|---------|--------|----------|-------------|
| **Whiteboard OCR** | ⚪ Backlog | P1 | Snap a photo of a whiteboard to extract tasks and diagrams. |
| **Voice Signature ID** | ⚪ Backlog | P2 | Assigning tasks based on speaker's known voice profile in a physical room. |
| **Real-time Suggestions**| ⚪ Backlog | P1 | During a call, pop-up a notification: *"You just promised X. Should I add it to Jira?"* |

### Q3: The "Closed-Loop" Phase
**Focus**: Ensuring the tasks actually get done.
| Feature | Status | Priority | Description |
|---------|--------|----------|-------------|
| **Auto-Follow-up Bot** | ⚪ Backlog | P2 | Slack DM to stakeholders when a deadline is approaching. |
| **Cross-Org Task Share** | ⚪ Backlog | P1 | Securely sharing a specific task with an external contractor/client. |
| **Multi-App Sync** | ⚪ Backlog | P0 | Syncing the same task across Jira, Linear, and Trello simultaneously. |

---

## 📦 MVP Feature List (Must Haves)

| Feature | Why |
|---------|-----|
| Diarization | You must know **who** said they would do it. |
| Deadline Parsing | A task without a date is just a wish. |
| "Add to Integration" | One-click export to the user's existing work tools. |
