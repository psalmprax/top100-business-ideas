# Extended Use Cases: ObligationTrack (Contract Tracker)

## Core Use Cases (1-3)

### Use Case 1: The "Termination Window" Alarm
**The Competitor Way**: You miss a 90-day termination window for an expensive software license. You are locked in for another $20k year.
**The ObligationTrack Override**: ObligationTrack uses AI to parse your PDFs. It finds the *exact* clause for termination and sets a "Hard Alarm" in your calendar 100 days out. It requires a "Decision Signature" from the PM to snooze the alert.

### Use Case 2: Implicit Liability Flagging
**The Competitor Way**: You sign a supplier contract with a "Liability Cap" that is too low. A lawsuit happens, and your company is exposed.
**The ObligationTrack Override**: ObligationTrack scans your contracts for "Liability Red Zones." It flags clauses that deviate from your company's "Standard Risk Profile" and suggests renegotiation terms: "Supplier cap is $10k, your standard is $50k. Flagged."

### Use Case 3: The "Change of Control" Audit
**The Competitor Way**: You are being acquired. The buyer asks for a list of all contracts that "Terminate on Change of Control." You spend 2 weeks reading 400 PDFs.
**The ObligationTrack Override**: One-click "Exit Audit." ObligationTrack filters every contract for M&A-critical clauses and generates a spreadsheet for the due diligence room in 60 seconds.

---

## Extended Use Cases (4-10)

### Use Case 4: Renewal Dashboard (Cash Flow)
**Scenario**: CFO needs to know upcoming renewal costs for Q3
**Solution**: Calendar and spend heat-map showing exactly when payments are due based on contract dates.

### Use Case 5: Supplier Performance Scorecard
**Scenario**: A vendor is consistently missing SLAs mentioned in the contract
**Solution**: Link contract obligations to actual helpdesk/uptime data to track "SLA Compliance" automatically.

### Use Case 6: Multi-Entity Contract View
**Scenario**: Parent company needs to see contracts for 5 subsidiaries
**Solution**: Hierarchical dashboard showing contract ownership and shared liabilities across the group.

### Use Case 7: Regulatory Alignment (GDPR/DCC)
**Scenario**: Keeping track of "Data Processing Addendums" (DPAs)
**Solution**: Checklist showing which vendors have signed DPAs and which ones are outdated.

### Use Case 8: Mobile "Snap & Track" Contract Extraction (Mobile)
**Scenario**: Exec signing a physical contract at a dinner and needs it filed immediately.
**Solution**: Mobile camera interface with real-time OCR that extracts key dates/values and files the contract to the cloud vault instantly.

### Use Case 9: Contract Negotiation Hub
**Scenario**: Team is redlining a contract back and forth
**Solution**: Version control for contracts showing "Historical Deviation" from your preferred terms.

### Use Case 11: Multi-Jurisdictional Legal Clause Mapping (EU/UK/US)
**Scenario**: A global company needs to ensure all supplier contracts comply with the diverging data privacy laws in the UK, EU (GDPR), and US (CCPA).
**Solution**: ObligationTrack automatically tags clauses with "Jurisdictional Logic." It provides a cross-border delta report showing where a contract signed under UK law might fail EU compliance requirements, enabling proactive legal remediation.

### Use Case 12: Priority "Legal Desk" Enterprise SLA
**Scenario**: A General Counsel at a multinational firm needs immediate help interpreting a "Conflict of Law" clause during a high-stakes investigation.
**Solution**: Enterprise-tier ObligationTrack includes a "Dedicated Legal Desk" SLA. This provides a 30-minute response bypass for jurisdictional interpretation queries, where our senior legal engineers help map the contract's obligations against current regulatory changes in real-time.

---

## Customer Journey Coverage

| Stage | Use Cases | Description |
|-------|-----------|-------------|
| **Discovery** | 1-3 | Core contract intelligence |
| **Onboarding** | 4-5 | Setup and performance tracking |
| **Daily Use** | 6-7 | Global liability visibility |
| **Scale** | 8-9 | Mobile capture and ROI |
| **Enterprise** | 10-12 | Compliance, jurisdictional mapping, and Legal Desk SLA |

---

### Use Case 13: GraphQL Federated Contract Schema (Integration)
**Scenario**: A corporate legal department needs to integrate contract liability data into their global risk management dashboard, which already pulls data from financial and operational APIs.
**Solution**: ObligationTrack offers a GraphQL Federated API. This allows legal ops to weave contract data into a larger enterprise data graph. They can query liabilities specifically for "Strategic Partners" across multiple subsidiaries and timeframes in a single query, enabling seamless cross-departmental data synchronization.

---

## Customer Journey Coverage

| Stage | Use Cases | Description |
|-------|-----------|-------------|
| **Discovery** | 1-3 | Core contract intelligence |
| **Onboarding** | 4-5 | Setup and performance tracking |
| **Daily Use** | 6-7 | Global liability visibility |
| **Scale** | 8-9 | Mobile capture and ROI |
| **Enterprise** | 10-13 | Compliance, jurisdictional mapping, and GraphQL Federated Schema |

---

## Technical Coverage Status

| Category | Status | Priority |
| :--- | :--- | :--- |
| **Localization** | ✅ COVERED (UC11) | Multi-jurisdictional mapper |
| **Mobile** | ✅ COVERED (UC8) | Native Snap & Track app |
| **Integration** | ✅ COVERED (UC13) | GraphQL Federated Schema |
| **Compliance** | ✅ COVERED (UC10) | Signature fulfillment |

*Last updated: 2026-03-17 (Hardened Enterprise v1.3)*
