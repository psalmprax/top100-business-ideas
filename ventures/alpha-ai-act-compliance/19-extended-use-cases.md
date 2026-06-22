# Extended Use Cases: ReguLens (EU AI Act Compliance)

## Core Use Cases (1-3)

### Use Case 1: Automated Technical Documentation Folder

**The Competitor Way**: A compliance officer manually creates a 50-page PDF documenting every AI model in the company, then manually updates it every time a new model is deployed.
**The ReguLens Override**: ReguLens connects to your CI/CD pipeline and automatically generates the full "Technical Documentation Folder" required under Article 11 of the EU AI Act. It captures: model architecture, training data provenance, validation results, and intended purpose. It's instantly exportable in the exact format required by EU regulators.

### Use Case 2: Training Data Bias Scan

**The Competitor Way**: You manually review 10,000 training images for bias in a spreadsheet.
**The ReguLens Override**: ReguLens scans your training data and automatically flags demographic bias. It provides a "Bias Report" showing whether your model has disparate impact across protected classes, with statistical significance. This is your "Data Governance" proof point for Article 10 compliance.

### Use Case 3: The Adversarial Audit Bot

**The Competitor Way**: You hire a Big 4 consulting firm to spend 3 months auditing your AI systems.
**The ReguLens Override**: ReguLens deploys a "Red Team Agent" that continuously probes your AI for vulnerabilities: adversarial inputs, jailbreak attempts, and systemic failures. It generates a live "Audit Report" you can hand to regulators.

---

## Extended Use Cases (4-10)

### Use Case 4: EU Database Registration

**Scenario**: High-risk AI systems must register in the EU database
**Solution**: Automated registration workflow that pre-fills forms and submits to the EU AI Office database

### Use Case 5: Incident Reporting (Article 71)

**Scenario**: AI incidents must be reported to authorities within 72 hours
**Solution**: Automated incident detection and report generation with template compliance

### Use Case 6: Model Card Generation

**Scenario**: Each model needs a "model card" with performance metrics
**Solution**: Auto-generated model cards from training runs with accuracy, fairness, and robustness metrics

### Use Case 7: Third-Party Vendor Compliance

**Scenario**: Using external AI APIs requires supply chain documentation
**Solution**: Vendor intake forms and API compliance verification

### Use Case 8: GDPR + AI Act Alignment

**Scenario**: Both GDPR and AI Act apply to the same systems
**Solution**: Unified compliance dashboard showing overlapping requirements

### Use Case 9: Real-Time Compliance Dashboard

**Scenario**: Leadership needs visibility into compliance status
**Solution**: Executive dashboard with compliance score, risk items, and remediation tracking

### Use Case 10: Training & Awareness

**Scenario**: Teams need to understand AI Act requirements
**Solution**: Interactive training modules and certification tracking

### Use Case 11: Enterprise High-Availability (DR) for Compliance Monitoring

**Scenario**: Global bank requires 99.99% uptime for their Article 61 Post-Market Monitoring logs.
**Solution**: Multi-region compliance clusters with state-synchronized auditing. If one region fails, the "Compliance Ledger" remains immutable and accessible for regulatory discovery.

### Use Case 12: White-label Compliance Portal for Consultants

**Scenario**: A law firm or consulting agency (Big 4) wants to manage AI Act audits for 100 clients.
**Solution**: Multi-tenant "Agency Desk" where consultants can invite clients, run automated conformancy assessments, and issue certified reports under their own brand.

### Use Case 13: Multi-Jurisdictional Mapping (Localization)

**Scenario**: A US-based tech company deploying in the EU needs to comply with both the EU AI Act and the US NIST AI Risk Management Framework.
**Solution**: Cross-regulatory "Requirement Mapping." A single evidence upload (e.g., training data logs) is automatically mapped to both EU and US requirements, highlighting delta gaps where US rules are less/more stringent.

### Use Case 14: Edge AI On-site Compliance Audit (Mobile/Edge)

**Scenario**: Industrial AI running on local factory floor hardware without constant internet access.
**Solution**: Local "Compliance Sidecar" that performs on-device auditing and batch-syncs logs when a secure connection is established, ensuring physical safety logs are never lost.

### Use Case 15: Shadow AI Surveillance (Integration with AgentOps)

**Scenario**: Enterprise employees using "Shadow AI" (unauthorized ChatGPT/Claude accounts) to process sensitive corporate data.
**Solution**: Integration with **AgentOps Sentinel** to monitor outbound API traffic and browser patterns. ReguLens automatically flags when non-sanctioned LLMs are used for tasks that fall under "High Risk" Annex III categories, preventing accidental non-compliance.

---

## Customer Journey Coverage

| Stage          | Use Cases | Description                                                    |
| -------------- | --------- | -------------------------------------------------------------- |
| **Discovery**  | 1-3       | Core compliance value                                          |
| **Onboarding** | 4-5       | Registration and setup                                         |
| **Daily Use**  | 6-7       | Monitoring and vendors                                         |
| **Scale**      | 8-9       | Enterprise features                                            |
| **Global/Ent** | 10-16     | Advanced multi-market compliance, Shadow AI, and GraphQL Graph |

---

### Use Case 16: Compliance-as-Graph (GraphQL Federated Schema)

**Scenario**: Internal audit tools need to discover relationships between specific AI modules, their Annex III risk classification, and the corresponding Evidence Mapping in GitHub.
**Solution**: ReguLens provides a Federated GraphQL schema. This allows compliance data to be treated as a navigable graph, where an auditor can query "All High-Risk models whose Technical Documentation is out-of-sync with production CI/CD tags," providing unprecedented visibility into regulatory drift.

---

### Use Case 17: Supply Chain Risk Audit (Tier-2/3 Vendor Drilldown)

**Scenario**: A company uses a 3rd-party LLM that itself relies on a specific dataset or sub-processor that's found to be non-compliant with the AI Act.
**Solution**: ReguLens maps the "AI Supply Chain." It allows enterprises to drill down into the compliance status of sub-vendors (Tier-2/3). It automatically flags if a part of the AI stack (e.g., an embedding model or vector DB) lacks the necessary Article 11 technical folders, ensuring end-to-end liability protection.

### Use Case 18: Annex IV Real-time Evidence Mapping

**Scenario**: A regulator requests proof that the current production model (v2.1) matches the technical documentation submitted 6 months ago.
**Solution**: ReguLens provides "Live Evidence Binding." It maps specific GitHub commits and CI/CD validation logs directly to the Annex IV reporting requirements. If the production code drifts from the compliance baseline, ReguLens triggers an "Out-of-Sync" alert, allowing the company to remediate the documentation or roll back the model instantly.

---

### Use Case 19: Automated Compliance Webhooks (Article 71 & Risk Alerts)

**Scenario**: A high-risk AI system detects a sudden drift in training data bias. The compliance team needs this event to automatically trigger a "L1 Incident" in their Jira/ServiceNow instance.
**Solution**: ReguLens features a real-time Webhook engine. Any compliance event—such as a bias threshold breach, a missing Article 11 technical folder, or a regulatory registration failure—triggers an automated payload to predefined endpoints. This allows ReguLens to be the "Safety Signal" that orchestrates enterprise-wide incident response.

---

### Use Case 20: China MLPS & Algorithmic Filing Compliance

**Scenario**: A European retailer using AI recommendation engines in their Shanghai branches must comply with China's "Multi-Level Protection Scheme" (MLPS) and the CAC's algorithmic filing requirements.
**Solution**: ReguLens provides a "China-Specific Appendix." It maps EU AI Act evidence (Article 11) to the specific "Security Assessment" and "Algorithm Filing" templates required by the Cyberspace Administration of China (CAC). It includes built-in checks for data sovereignty rules and specific algorithmic transparency mandates for the Chinese market.

### Use Case 21: Canadian AIDA (Artificial Intelligence and Data Act) Alignment

**Scenario**: A tech company expanding to Canada needs to ensure their high-impact AI systems meet the safety and human-rights requirements of the proposed AIDA.
**Solution**: ReguLens maps existing compliance evidence to the "Fairness and Safety Plan" required by AIDA. It tracks specific "High-Impact" classifications in the Canadian context and automates the record-keeping required for the Minister of Innovation, Science and Economic Development.

### Use Case 22: UK AI Safety Institute & Post-Brexit Alignment

**Scenario**: A global bank operating in London needs to align with the UK's "Pro-Innovation" AI framework and the safety benchmarks issued by the UK AI Safety Institute.
**Solution**: ReguLens offers a "UK Governance Module." It translates "High-Risk" EU mandates into the UK's sector-led principles (e.g., FCA/PRA guidance for finance). It integrates the latest safety test suites from the UK AI Safety Institute, allowing the bank to demonstrate "Safety-by-Design" in the UK's flexible regulatory environment.

**Concrete Mapping Table (5 UK pro-innovation principles → codebase controls):**

| # | UK Principle | ReguLens Codebase Control |
|---|---|---|
| 1 | Safety, security, and robustness | `services/regional_compliance.py` → `UK-SAFETY-1` (AISI red-teaming alignment) |
| 2 | Appropriate transparency and explainability | Pre-deployment assessment API → `UK-SAFETY-2` |
| 3 | Fairness | Data bias scan + `UK-SAFETY-3` sectoral tests |
| 4 | Accountability and governance | Compliance ledgers + `UK-SAFETY-4` SMCR-friendly trail |
| 5 | Contestability and redress | Human-in-the-loop incident trigger → `UK-SAFETY-5` |

**Status**: ✅ COVERED (UC22 — UK post-Brexit regime).

---

## Technical Coverage Matrix

| Category         | Status            | Priority                          |
| :--------------- | :---------------- | :-------------------------------- |
| **Mobile/Edge**  | ✅ COVERED        | Optimized for remote audit        |
| **Localization** | ✅ COVERED        | Multi-regulatory mapping          |
| **China/MLPS**   | ✅ COVERED (UC20) | CAC Algorithmic Filing            |
| **Canada/AIDA**  | ✅ COVERED (UC21) | ISED Alignment                    |
| **UK Safety**    | ✅ COVERED (UC22) | Post-Brexit Compliance            |
| **White-label**  | ✅ COVERED        | Agency desk for consultants       |
| **Shadow AI**    | ✅ COVERED        | Monitoring with AgentOps Sentinel |
| **Supply Chain** | ✅ COVERED (UC17) | End-to-end tier-2/3 visibility    |
| **Evidence Map** | ✅ COVERED (UC18) | Live CI/CD to Annex IV sync       |
| **Webhooks**     | ✅ COVERED (UC19) | Real-time incident triggers       |

_Last updated: 2026-03-19 (Alpha Elite v1.5 - Absolute Coverage)_
