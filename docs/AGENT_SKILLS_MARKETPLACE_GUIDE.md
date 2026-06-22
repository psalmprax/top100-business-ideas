This guide maps the **OpenClaw** and **ClawHub** skill ecosystem to the hardened **Alpha Agent Ops** and **Compliance** infrastructure. It also documents the **Hybrid Discovery Marketplace** used for client transparency and internal deployment.

## 🏢 Governance & Compliance (Priority #1)

Your architecture now supports real-time Article 61 monitoring and Sovereign approvals. The following skills from ClawHub and Paperclip should be used to populate these modules:

| Required Capability    | ClawHub / External Skill       | Integration Point                        |
| :--------------------- | :----------------------------- | :--------------------------------------- |
| **Risk Assessment**    | `AI Governance Policy Builder` | `ComplianceService.register_model`       |
| **Budget Enforcement** | `MagiC` (Circuit Breakers)     | `AgentOpsService.check_budget_guardrail` |
| **Human-in-the-loop**  | `Paperclip Governance Unit`    | `SovereignRequest`                       |
| **Threat Scanning**    | `Meerkat Governance`           | `AgentOpsService.validate_agent_action`  |

## 🛠️ Operational Excellence (Agent Ops)

For your "Autonomous Ops" and "Strategic Sentinel" tiers, these skills provide the "muscle" for the governance "brain":

| Tooling Tier            | Recommended Skill       | Purpose                                                 |
| :---------------------- | :---------------------- | :------------------------------------------------------ |
| **Self-Healing**        | `self-improving-agent`  | Feeds into `SelfHealingEvent` logs.                     |
| **Memory Architecture** | `ontology`              | Structures `AgentMemorySegment` as a typed graph.       |
| **Security**            | `LLM Guard`             | Scans input/output to sanitize `AgentAuditLog` entries. |
| **Observability**       | `Helicone` / `Langfuse` | Consumes `AgentOpsService.trace_action` logs.           |

## 🧬 Scientific & Research Skills (Claw4Science)

For complex multi-agent simulations or scientific benchmarks:

- **`PinchBench`**: Use this to generate the `Validation Evidence Log` required for EU AI Act Annex IV technical documentation.
- **`LabClaw`**: Use this to manage reproducibility in high-accuracy environments (Article 15).

---

## 🏛️ Hybrid Discovery Marketplace (2026 Model)

The Alpha platform uses a **Hybrid Gated Discovery** model to balance client transparency with intellectual property protection.

### 🍱 Access Tiers

- **Client/Public View**:
  - **"Ingredient AI" Transparency**: Clients can browse the marketplace to see which specialized skills (BIM, ESG, Medical Coding) power their product.
  - **Trust Building**: Verification badges for ClawHub and GitHub Open Source skills.
  - **Engagement**: "Learn More" call-to-action for non-management users.
- **Internal/Management View**:
  - **Deploy directly to workforce**: One-click installation of skills to the active agent pool (`isManagement` required).
  - **Full Technical Audit**: Access to technical documentation and internal logic.

### 🛡️ The "Proprietary Shield"

To protect your "Secret Sauce," the marketplace implements automated redaction:

- **Redacted Descriptions**: Clients see high-level "Marketing Descriptions" focused on ROI. Internals see full "Technical Descriptions."
- **Hidden Repositories**: Non-management users cannot see links to proprietary internal codebases.
- **Badge Differentiation**: Proprietary skills are clearly marked with a "Proprietary" badge to distinguish them from community-sourced plugins.

## 🚀 How to "Install" a Skill (Internal)

1. **Navigate** to the [Skill Marketplace](/marketplace).
2. **Search** for the required capability (e.g., "v061" or "Construction").
3. **Deploy**: Click **"Install & Deploy to Workforce"**.
4. **Sync**: The `AgentOpsService` will automatically equip the relevant agents with the new capability and update the `AgentAuditLog`.
