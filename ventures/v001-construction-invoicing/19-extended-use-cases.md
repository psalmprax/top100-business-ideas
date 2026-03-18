# Extended Use Cases: Constructiv (Construction Invoicing)

## Core Use Cases (1-3)

### Use Case 1: The State-Specific Lien Waiver Generator
**The Competitor Way**: A GC emails a PDF lien waiver to a subcontractor. The subcontractor signs it. 3 months later, the GC gets sued because the lien waiver wasn't compliant with California's specific statutory requirements.
**The Constructiv Override**: Constructiv auto-generates lien waivers that are pre-coded to the exact statutory requirements of each state. You select the state, project, and subcontractor, and it generates a legally compliant PDF. It's integrated with the county recorder so the lien waiver is automatically filed.

### Use Case 2: Visual Proof of Completion
**The Competitor Way**: A PM drives to a job site, takes photos with their personal phone, and emails them to the office. The photos get lost in inboxes.
**The Constructiv Override**: Constructiv has a "Site Camera" feature. You scan a QR code on the job site and it opens a time-stamped, GPS-verified photo capture. Photos are automatically attached to the correct invoice and stored in the cloud.

### Use Case 3: The Prompt Payment Trigger
**The Competitor Way**: A GC receives an invoice and sits on it for 45 days. The subcontractor has no visibility into when they'll get paid.
**The Constructiv Override**: Constructiv integrates with the GC's accounting system. When the GC marks the invoice "Approved," Constructiv automatically triggers the payment within the state's statutory timeframe (e.g., 7 days in California). The subcontractor gets a notification: "Your payment has been initiated."

---

## Extended Use Cases (4-10)

### Use Case 4: Material Procurement Integration
**Scenario**: Need to track materials from order to install
**Solution**: Integration with suppliers to track material deliveries and attach to job costing

### Use Case 5: Equipment Tracking
**Scenario**: Equipment rental costs need to be allocated to jobs
**Solution**: GPS tracking of equipment with automatic job costing allocation

### Use Case 6: Time Tracking & Labor Management
**Scenario**: Track field worker hours per job
**Solution**: Mobile time clock with GPS check-in/out, integrated with payroll

### Use Case 7: Job Costing Dashboard
**Scenario**: Real-time view of project profitability
**Solution**: Dashboard showing budget vs. actual by job, phase, and cost code

### Use Case 8: Change Order Management
**Scenario**: Handle scope changes and approvals
**Solution**: Digital change order workflow with approval tracking and cost impact

### Use Case 9: Subcontractor Portal
**Scenario**: Subs need self-service access
**Solution**: Portal for subs to view invoices, submit documentation, and track payments

### Use Case 10: Retention Tracking
**Scenario**: Track retention percentages and release schedules
**Solution**: Automated retention release based on project milestones and lien waivers

---

### Use Case 11: Public REST API (Enterprise ERP Sync)
**Scenario**: A large commercial construction firm needs to sync their Constructiv lien waivers and GPS-verified photo proofs directly into their existing Oracle or SAP ERP system.
**Solution**: Constructiv provides a robust Public REST API with detailed documentation. It allows enterprise developers to programmatically fetch GPS-stamped attachments, automate invoice triggers from internal approvals, and maintain a "Single Source of Truth" across their legacy stack.

### Use Case 12: Native Construction Hub App (Field Worker Moat)
**Scenario**: Subcontractors on a remote job site with zero internet connectivity need to log progress and take GPS-stamped completion photos.
**Solution**: The native Constructiv Hub app (iOS/Android) features a local-first architecture. Field workers can capture evidence and log hours offline; the app automatically syncs the data with GPS and time-stamp verification once they return to coverage, ensuring no work is ever unmonitored.

### Use Case 13: 24/7 Enterprise "Field Support" SLA
**Scenario**: A massive infrastructure project hits a critical milestone at 3 AM on a Sunday, and the automated lien waiver filing service encounters a jurisdictional error.
**Solution**: Enterprise-tier Constructiv includes a 24/7 "Field Readiness" SLA. Enterprise clients have direct access to a dedicated Field Engineer who can manually override jurisdictional blocks and ensure that critical compliance filings are processed within 60 minutes, regardless of the time.

---

## Customer Journey Coverage

| Stage | Use Cases | Description |
|-------|-----------|-------------|
| **Discovery** | 1-3 | Core invoicing value |
| **Onboarding** | 4-5 | Setup and integration |
| **Daily Use** | 6-7 | Operations management |
| **Scale** | 8-9 | Multi-party workflows |
| **Enterprise** | 10-13 | Retention, API, Mobile Hub, and 24/7 SLA |

---

## Technical Coverage Status

| Category | Status | Priority |
| :--- | :--- | :--- |
| **API** | ✅ COVERED (UC11) | Public REST API |
| **Mobile** | ✅ COVERED (UC12) | Native field hub app |
| **SLA/Support** | ✅ COVERED (UC13) | 24/7 Field support desk |
| **Integration** | ✅ COVERED (UC4) | Material procurement |

*Last updated: 2026-03-17 (Hardened Legacy v1.0)*
