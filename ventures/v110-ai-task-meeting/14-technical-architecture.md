# Technical Architecture: TaskFlow AI (Meeting Task Automation)

## 🏗️ System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      INPUT SOURCES                          │
│  [Zoom/Teams API] [Browser Ext] [Mobile Cam - Whiteboards]  │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    INGESTION & DIARIZATION                  │
│  [Audio Streamer] → [Whisper-v3] → [Speaker Diarizer]       │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  COMMITMENT DETECTION ENGINE                │
│  [Context Parser] → [De-Identification] → [Task Extractor]   │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      INTEGRATION HUB                        │
│  [Linear API] [Jira Cloud] [Asana] [Slack Webhooks]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

### Inference Layer (The "Brain")

| Component         | Technology          | Rationale                                                    |
| ----------------- | ------------------- | ------------------------------------------------------------ |
| Transcription     | OpenAI Whisper-v3   | Industry standard for high-accuracy multi-speaker audio.     |
| Task Extraction   | GPT-4o-mini         | Optimized for structured JSON extraction from long contexts. |
| OCR (Whiteboards) | Google Cloud Vision | Best-in-class for messy handwritten whiteboard text capture. |

### Backend & Real-time

| Component     | Technology     | Rationale                                                           |
| ------------- | -------------- | ------------------------------------------------------------------- |
| API Framework | Go (Gin)       | High-concurrency required for simultaneous audio stream processing. |
| Streaming     | WebSockets     | Real-time "Task Pop-ups" while the meeting is still happening.      |
| Queue         | Redis (BullMQ) | Offloading heavy transcription jobs to async workers.               |

---

## 📐 Data Schema (Task Modeling)

### Commitment Object

```json
{
  "id": "commit_923J",
  "source_meeting": "uuid_882",
  "raw_text": "I will send the Q3 report to Sarah by Friday",
  "owner": "psalmprax",
  "stakeholder": "Sarah",
  "deadline": "2026-03-20T17:00:00Z",
  "confidence_score": 0.98,
  "status": "pending_approval"
}
```

---

## 🔐 Security Architecture

### "Privileged Audio" Handling

- **Non-Retention Policy**: Audio files are deleted immediately after transcription and task extraction (SLA < 5 mins).
- **On-Prem Processing**: For Enterprise clients, we offer a "Private Cloud" deployment where audio never leaves their VPC.

---

## 📈 Scaling Strategy

### Handling 100k+ Concurrent Meetings

| Target             | Strategy                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Transcription Load | Running dedicated GPU clusters on RunPod/Lambda for local Whisper inference to avoid OpenAI rate limits. |
| Memory management  | Using structured stream-parsing to avoid loading 2-hour meeting transcripts into RAM at once.            |
