# Pricing Strategy: Agent Ops Sentinel

## 💰 Pricing Philosophy

### Core Principles

1. **Developer Adoption First**: The local, single-agent use case must be mathematically free to encourage testing and hacking.
2. **Tax the Scale, Not the Feature**: We don't gate API features. We charge based on the sheer volume of tokens we are inspecting, aligning our revenue with their AI success.
3. **Enterprise Security is Premium**: VPC peering, SOC2 audits, and SSO are charged at a massive premium because they are procured by the C-Suite, not the developer.

---

## 📊 Pricing Tiers

### Current Pricing (Launch)

| Tier           | Price  | Features                                                          | Target                           |
| -------------- | ------ | ----------------------------------------------------------------- | -------------------------------- |
| **Developer**  | £0     | Up to 1M tokens inspected/mo, 1 agent.                            | Solo hackers, prototypes.        |
| **Growth**     | £49/mo | Base fee + £1.20 per 1M tokens. 5 Custom Rules.                   | Startups, small production apps. |
| **Enterprise** | Custom | Starts at £850/mo. Unlimited agents, PII Masking, VPC deployment. | Series B+, Mid-Market, Corp.     |

---

## 💵 Unit Economics by Tier

### Cloud Infrastructure Cost

_Inspecting 1M tokens through the Rust proxy costs us approximately £0.05 in compute._
_Offering a 1M token free tier costs us penties per user._

| Tier       | Estimated ARPU | Gross Margin                  |
| ---------- | -------------- | ----------------------------- |
| Developer  | £0             | ~ 0%                          |
| Growth     | £150           | 95%                           |
| Enterprise | £1,500         | 90% (Includes support burden) |

---

## 🎯 Pricing Psychology

### Anchoring

We anchor our pricing against **the money we save them**.
_Marketing message_: "You pay OpenAI £5.00 for 1M GPT-4 Output tokens. You pay us £1.20 to ensure those 1M tokens weren't wasted on a hallucination loop. Sentinel pays for itself if it catches a single 25% failure rate."

---

## 📈 Competitor Pricing

| Competitor    | Pricing Model                | Weakness                                | Our Advantage                                                        |
| ------------- | ---------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| **LangSmith** | Tiered + Seat based          | Penalizes collaboration                 | We don't charge per seat.                                            |
| **Datadog**   | Per Host / Gigabyte ingested | Extremely expensive for dense text logs | We process at the edge; no massive log storage fees unless required. |

---

## 💳 Billing Strategy

### Usage-Based Metering

We use **Stripe Metered Billing**.
The Rust proxy batches token inspection counts to a Redis queue, which syncs to Stripe every 1 hour. This prevents us from paying Stripe API fees per request.
