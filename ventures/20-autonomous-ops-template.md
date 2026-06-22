# Autonomous Operations Template: [VENTURE NAME]

## 🤖 AI Agent Identity & Priority

- **Primary Objective**: [e.g., Lead Generation and Conversion]
- **Operational Priority**: [e.g., Quality over Quantity / Speed over Accuracy]
- **Persona Constraints**: [e.g., Tone, Forbidden Topics]

## 🔄 Self-Healing Protocols (Error Recovery)

| Scenario                        | Autonomous Action (Failover)               | Human Escalation Trigger        |
| ------------------------------- | ------------------------------------------ | ------------------------------- |
| Platform Block (e.g., LinkedIn) | Pivot to secondary channel (Email/Reddit)  | Repeated blocks on all channels |
| API Failure                     | Cache data and retry in 1 hour             | 24+ hours of downtime           |
| High Cost Anomaly               | Kill current loop; switch to cheaper model | Cost reaches 50% of daily total |
| Lead Exhaustion                 | Search for adjacent niche (defined below)  | Niche totally exhausted         |

## 🎯 Autonomous Lead Generation Logic

### Niche Expansion Path

1. **Core Niche**: [Primary target]
2. **Expansion 1**: [Closest adjacent market]
3. **Expansion 2**: [Broad market application]

### Lead Scoring (Auto-Qualification)

- **High Intent**: [Keywords/Criteria] → DM immediately.
- **Medium Intent**: [Keywords/Criteria] → Subscribe/Like; follow up in 2 days.
- **Low Intent**: [Keywords/Criteria] → Log in CRM only.

## 💬 Autonomous Outreach Pivot Logic

### Channel A: [Primary, e.g., LinkedIn]

- **Script Ref**: `04-outreach.md`
- **Constraint**: Daily limit 20.
- **Pivot to B**: If reply rate < 5% after 100 sends.

### Channel B: [Secondary, e.g., Reddit]

- **Target Subreddits**: [List]
- **Strategy**: Value-add comment → Direct Message.

## 🛑 Hard Governance Rails

- **Spending Limit**: $[Amount]/day
- **Compliance Check**: Must cross-reference against `11-legal-compliance.md` before sending any legal/financial advice.
- **Deduplication**: Never message the same ID from more than one venture agent.
