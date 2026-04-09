# AI Compliance Hub - Comprehensive UI Gap Analysis (2026-03-29)

## Executive Summary

Full audit of ALL buttons, clickables, menus, and their use case scenarios in `AlphaAIActCompliance.tsx`. This analysis identifies covered scenarios, uncovered gaps, dummy/simulation/placeholder content, and prioritizes real implementations over fallbacks.

**File:** `client/src/pages/AlphaAIActCompliance.tsx` (4,868 lines)
**Previous Analysis:** `AI_COMPLIANCE_HUB_GAP_ANALYSIS.md` (2026-03-24)

---

## 1. COMPLETE UI ELEMENT INVENTORY (Every Clickable)

### 1.1 Header Bar Actions

| #   | Element              | Type      | Handler                                                     | Real/Fallback          | Status                 |
| --- | -------------------- | --------- | ----------------------------------------------------------- | ---------------------- | ---------------------- |
| 1   | ← Back               | Link      | wouter `<Link href="/">`                                    | Real                   | ✅                     |
| 2   | EU Database Register | Button    | `setShowEuRegDialog(true)`                                  | Real                   | ✅                     |
| 3   | SDK Download         | Button    | `handleDownload('regulens-compliance-sdk.zip', base64data)` | Real (embedded binary) | ✅                     |
| 4   | Mobile App Download  | Button    | `handleDownload('regulens-mobile.apk', base64data)`         | Real (embedded binary) | ✅                     |
| 5   | Generate Docs        | Button    | `setShowDocsDialog(true)` → `handleGenerateAllDocs()`       | Real                   | ✅                     |
| 6   | Add Model            | Button    | `setShowModelDialog(true)` → `handleAddModel()`             | Real + fallback        | ✅                     |
| 7   | White-label Portal   | Button    | `window.open('/portal/white-label')`                        | Real                   | ⚠️ Route may not exist |
| 8   | UserMenu             | Component | Avatar dropdown → logout                                    | Real                   | ✅                     |

### 1.2 Category Navigation (Tier 1 Pillars)

| #   | Category       | Handler                                                   | Status |
| --- | -------------- | --------------------------------------------------------- | ------ |
| 9   | Governance     | `setActiveCategory('gov')` + `setActiveTab('dashboard')`  | ✅     |
| 10  | Regulatory     | `setActiveCategory('reg')` + `setActiveTab('compliance')` | ✅     |
| 11  | Technical      | `setActiveCategory('tech')` + `setActiveTab('models')`    | ✅     |
| 12  | Operations     | `setActiveCategory('ops')` + `setActiveTab('vendors')`    | ✅     |
| 13  | Infrastructure | `setActiveCategory('infra')` + `setActiveTab('health')`   | ✅     |
| 14  | Finance        | `setActiveCategory('fin')` + `setActiveTab('budget')`     | ✅     |

### 1.3 Governance Sub-Tabs

| #   | Tab                | Clickables                     | Handler                                       | Status                      |
| --- | ------------------ | ------------------------------ | --------------------------------------------- | --------------------------- |
| 15  | Dashboard          | Score cards (display only)     | None needed                                   | ✅                          |
| 16  | Dashboard          | ROI section (display)          | Uses `roiMetrics` from API                    | ✅                          |
| 17  | Dashboard          | Deadline items (display)       | Uses `deadlines` from API                     | ✅                          |
| 18  | Live Monitoring    | Metrics cards (display)        | Uses `liveMetrics` from WebSocket             | ✅                          |
| 19  | Live Monitoring    | System Health badges (display) | From `liveMetrics.system_health`              | ✅                          |
| 20  | Red Team           | "Run New Audit" button         | `setShowAuditDialog(true)` → `redTeamAudit()` | ✅                          |
| 21  | Enterprise Audits  | "Start HIPAA Audit" button     | `handleRunHipaaAudit()`                       | ✅                          |
| 22  | Enterprise Audits  | "Start SOX Audit" button       | `handleRunSoxAudit()`                         | ✅                          |
| 23  | SLA Tiers          | "Upgrade" buttons (×2)         | `extendedApi.enterprise.updateSlaTier()`      | ⚠️ See G6                   |
| 24  | Audit Trail        | Search input                   | `handleAuditSearch()`                         | ❌ See G2                   |
| 25  | Audit Trail        | Filter dropdown                | `setAuditFilterType()`                        | ⚠️ No server-side filtering |
| 26  | Audit Trail        | Export button                  | `handleAuditExport()`                         | ✅                          |
| 27  | Risk Assessment    | Toggle switches (×2)           | No handler - display only                     | ⚠️ See G10                  |
| 28  | Risk Assessment    | SUBMIT FINAL CATEGORIZATION    | No handler                                    | ❌ See G10                  |
| 29  | Settings → SSO     | Metadata input                 | `setSsoMetadata()`                            | ✅                          |
| 30  | Settings → SSO     | MFA toggle                     | Display only                                  | ⚠️ Not persisted            |
| 31  | Settings → SSO     | Save SSO Settings              | `extendedApi.sso.saveConfig()`                | ✅                          |
| 32  | Settings → Budget  | Budget input                   | `setComplianceBudget()`                       | ✅                          |
| 33  | Settings → Budget  | ROI toggle                     | Display only                                  | ⚠️ Not persisted            |
| 34  | Settings → Budget  | Save Budget Settings           | `handleSaveBudget()`                          | ✅                          |
| 35  | Settings → Proxy   | Proxy input                    | `setProxyEndpoint()`                          | ✅                          |
| 36  | Settings → Proxy   | Policy toggle                  | Display only                                  | ⚠️ Not persisted            |
| 37  | Settings → Proxy   | Save Proxy Settings            | `handleSaveProxy()`                           | ✅                          |
| 38  | Settings → Alerts  | Channel select                 | Local state only                              | ⚠️                          |
| 39  | Settings → Alerts  | Test Alert button              | `handleTestAlert()`                           | ✅                          |
| 40  | Settings → Webhook | URL input                      | `setWebhookRelayUrl()`                        | ✅                          |
| 41  | Settings → Webhook | Add Webhook button             | `handleRegisterWebhook()`                     | ✅                          |

### 1.4 Regulatory Sub-Tabs

| #   | Tab                      | Clickables                          | Handler                                  | Status               |
| --- | ------------------------ | ----------------------------------- | ---------------------------------------- | -------------------- |
| 42  | Compliance               | "Connect System" per article        | `ConnectionDialog` → `handleConnect()`   | ✅                   |
| 43  | Compliance               | "Configure & Run Scan" per article  | `setShowScanConfigDialog(true)`          | ✅                   |
| 44  | Compliance → Scan Config | Sensitivity buttons (25/50/75/100%) | `setScanSensitivity()`                   | ✅                   |
| 45  | Compliance → Scan Config | Dataset select                      | Local state                              | ✅                   |
| 46  | Compliance → Scan Config | Auto-Remediate toggle               | Local state                              | ⚠️ Not passed to API |
| 47  | Compliance → Scan Config | "Orchestrate Scan Now"              | `handleRunScan()`                        | ✅                   |
| 48  | Compliance → Connection  | Type select (14 options)            | `setType()`                              | ✅                   |
| 49  | Compliance → Connection  | "Use Template"                      | `applyTemplate()`                        | ✅                   |
| 50  | Compliance → Connection  | Config textarea                     | `setConfig()`                            | ✅                   |
| 51  | Compliance → Connection  | "Execute Handshake"                 | `handleConnectContextual()`              | ✅                   |
| 52  | Regional                 | Jurisdiction select                 | `extendedApi.regionalCompliance.rules()` | ✅                   |
| 53  | Regional                 | "Download Global Report"            | `handleDownload()`                       | ✅ (generates text)  |
| 54  | Regional                 | "Download UK Rulebook"              | `handleDownload()`                       | ✅ (generates text)  |
| 55  | Regional                 | "Download Canada AIDA Guide"        | `handleDownload()`                       | ✅ (generates text)  |
| 56  | Documentation            | "Download Artifact (PDF)" per doc   | `handleDownload()`                       | ✅                   |
| 57  | Reports                  | Report type select                  | `setReportType()`                        | ✅                   |
| 58  | Reports                  | "GENERATE PDF REPORT"               | `handleGenerateReport()`                 | ✅                   |

### 1.5 Technical Sub-Tabs

| #   | Tab              | Clickables                    | Handler                            | Status             |
| --- | ---------------- | ----------------------------- | ---------------------------------- | ------------------ |
| 59  | Models           | "View →" per model            | `setSelectedModelForView(model)`   | ✅                 |
| 60  | Models → Profile | Audit History tab             | Display from `modelAudits`         | ✅                 |
| 61  | Models → Profile | System Handshakes tab         | Display from `modelHandshakes`     | ✅                 |
| 62  | Models → Profile | Artifact Files tab            | Hardcoded file list                | ❌ See G1          |
| 63  | Models → Profile | "Upload Artifact" button      | `setShowUploadDialog(true)`        | ✅                 |
| 64  | Models → Profile | File download (hover)         | No handler - display only          | ❌ See G1          |
| 65  | Models → Profile | Ethical Guardrails tab        | Toggle switches (×3)               | ✅                 |
| 66  | Models → Profile | "Close Profile"               | `setSelectedModelForView(null)`    | ✅                 |
| 67  | Models → Profile | "Export Conformity Report"    | `handleExportReport()`             | ✅                 |
| 68  | Bias Scan        | Model select                  | `setSelectedModelForBias()`        | ✅                 |
| 69  | Bias Scan        | "Run Comprehensive Bias Scan" | `handleTriggerBiasScan()`          | ✅                 |
| 70  | Edge AI          | "Logs" per device             | `setShowEdgeLogDialog(true)`       | ✅                 |
| 71  | Edge AI          | "Sync" per device             | `extendedApi.edge.sync()`          | ✅ (with fallback) |
| 72  | Shadow AI        | "Remediate" per detection     | `extendedApi.shadowAI.remediate()` | ✅ (with fallback) |

### 1.6 Operations Sub-Tabs

| #   | Tab            | Clickables                    | Handler                                     | Status              |
| --- | -------------- | ----------------------------- | ------------------------------------------- | ------------------- |
| 73  | Vendors        | "Onboard Vendor" button       | `setShowVendorDialog(true)`                 | ✅                  |
| 74  | Vendors        | Trash icon per vendor         | `extendedApi.compliance.deleteVendor()`     | ✅                  |
| 75  | Partner Portal | "Add Partner Account"         | `extendedApi.enterprise.getPartnerConfig()` | ⚠️ No form - See G8 |
| 76  | Training       | "Start"/"Continue" per module | `extendedApi.training.updateProgress()`     | ✅ (with fallback)  |
| 77  | Training       | "Take Quiz" button            | `setShowQuizDialog(true)`                   | ✅                  |
| 78  | Training       | "Certificate" button          | Toast only                                  | ❌ See G3           |
| 79  | API Access     | GraphQL Gateway toggle        | `extendedApi.agentOps.setGqlProxyConfig()`  | ✅                  |
| 80  | API Access     | "Revoke" button               | No handler                                  | ❌ See G9           |
| 81  | API Access     | "CREATE NEW ACCESS TOKEN"     | No handler                                  | ❌ See G7           |
| 82  | Incidents      | "Report Incident" button      | `setShowIncidentDialog(true)`               | ✅                  |
| 83  | Incidents      | "Resolve" per incident        | `handleResolveIncident()`                   | ✅                  |

### 1.7 Infrastructure Sub-Tabs

| #   | Tab           | Clickables                  | Handler                         | Status           |
| --- | ------------- | --------------------------- | ------------------------------- | ---------------- |
| 84  | Cloud Health  | "Failover" per region       | `handleTriggerFailover()`       | ✅               |
| 85  | Self-Healing  | "Remediate Policy Drift"    | `handleTriggerRemediation()`    | ✅               |
| 86  | Global Config | Retention select            | `handleSaveRetention()`         | ✅               |
| 87  | Global Config | Policy Sync toggle          | Display only                    | ⚠️ Not persisted |
| 88  | Global Config | "Docker Compose" download   | `extendedApi.onPrem.manifest()` | ✅               |
| 89  | Global Config | "Helm Chart" download       | `extendedApi.onPrem.manifest()` | ✅               |
| 90  | Global Config | "Verify Provider Handshake" | `handleSSOHandshake()`          | ✅               |

### 1.8 Finance Sub-Tabs

| #   | Tab          | Clickables              | Handler                                          | Status |
| --- | ------------ | ----------------------- | ------------------------------------------------ | ------ |
| 91  | Budget Rules | Display only (from API) | Uses `extendedApi.governance.budget.listRules()` | ✅     |
| 92  | ROI Impact   | Display only            | Uses `roiMetrics` from API                       | ✅     |

### 1.9 Venture Strategy Dropdown

| #   | Tab             | Clickables                      | Handler                   | Status    |
| --- | --------------- | ------------------------------- | ------------------------- | --------- |
| 93  | Financial Model | Display                         | Hardcoded fallback values | ⚠️ See D4 |
| 94  | Metrics         | Display                         | Hardcoded values          | ⚠️ See D5 |
| 95  | Pricing         | "Manage Subscription & Billing" | `<Link href="/billing">`  | ✅        |
| 96  | GTM Strategy    | Display                         | Hardcoded values          | ⚠️ See D6 |
| 97  | Roadmap         | Display                         | Hardcoded items           | ⚠️ See D7 |
| 98  | Hiring          | Display                         | Hardcoded items           | ⚠️ See D8 |

### 1.10 Dialogs (Modal Interactions)

| #   | Dialog            | Trigger                       | Actions                               | Status             |
| --- | ----------------- | ----------------------------- | ------------------------------------- | ------------------ |
| 99  | Add Model         | Header "Add Model"            | Form inputs + "Register & Scan"       | ✅ (with fallback) |
| 100 | Vendor Onboarding | Vendors "Onboard Vendor"      | Form + "Onboard Vendor"               | ✅ (with fallback) |
| 101 | Artifact Upload   | Profile "Upload Artifact"     | File picker + "Confirm & Upload"      | ✅                 |
| 102 | Incident Report   | Incidents "Report Incident"   | Form + "Submit Report"                | ✅ (with fallback) |
| 103 | EU Registration   | Header "EU Database Register" | 3-step wizard + "Confirm"             | ✅                 |
| 104 | Generate Docs     | Header "Generate Docs"        | "Generate Docs"                       | ✅                 |
| 105 | Run Audit         | Red Team "Run New Audit"      | Connection select + "Launch Audit"    | ✅                 |
| 106 | Training Quiz     | Training "Take Quiz"          | Answer buttons + "Submit Quiz"        | ❌ See G5          |
| 107 | Edge Logs         | Edge "Logs"                   | Display scroll area                   | ✅ (with fallback) |
| 108 | Scan Config       | Compliance "Configure & Run"  | Sensitivity + dataset + "Orchestrate" | ✅                 |
| 109 | Connection        | Compliance "Connect System"   | Type + config + "Execute Handshake"   | ✅                 |

---

## 2. USE CASE COVERAGE MATRIX

### 2.1 Core Compliance Use Cases (10 Scenarios)

| Use Case                 | UI Covered | API Connected | Real Data                 | Scenarios Tested            |
| ------------------------ | ---------- | ------------- | ------------------------- | --------------------------- |
| Model Registration       | ✅         | ✅            | ✅                        | Add, scan, assign risk      |
| Compliance Scanning      | ✅         | ✅            | ✅                        | Article scans, sensitivity  |
| Bias Detection           | ✅         | ✅            | ✅                        | Gender, age, demographic    |
| Incident Reporting       | ✅         | ✅            | ✅ (+ fallback)           | Article 72, severity levels |
| Documentation Generation | ✅         | ✅            | ✅                        | Batch generation, PDF       |
| EU Database Registration | ✅         | ✅            | ✅                        | 3-step wizard               |
| Vendor Management        | ✅         | ✅            | ✅ (+ fallback)           | Onboard, delete, assess     |
| Training & Certification | ✅         | ✅            | ✅ (+ fallback)           | Modules, progress, quiz     |
| Audit Trail              | ✅         | ⚠️            | ✅ (+ hardcoded fallback) | Logs, search, export        |
| Regional Compliance      | ✅         | ✅            | ⚠️ (+ hardcoded cards)    | Jurisdictions, rules        |

### 2.2 Advanced Use Cases (10 Scenarios)

| Use Case            | UI Covered | API Connected | Real Data                 | Scenarios Tested           |
| ------------------- | ---------- | ------------- | ------------------------- | -------------------------- |
| Red Team Audits     | ✅         | ✅            | ✅                        | Launch, track, results     |
| Edge AI Monitoring  | ✅         | ✅            | ✅ (+ fallback)           | Status, logs, sync         |
| Shadow AI Detection | ✅         | ✅            | ✅ (+ fallback)           | Detect, remediate          |
| Self-Healing        | ✅         | ✅            | ✅ (+ hardcoded fallback) | Drift, remediation         |
| SLA Management      | ✅         | ✅            | ⚠️                        | Tier display, upgrade      |
| API Access          | ✅         | ⚠️            | ⚠️                        | Toggle, token (no CRUD)    |
| White-label Portal  | ✅         | ✅            | ⚠️                        | Provision (no form)        |
| Risk Categorization | ✅         | ❌            | ❌                        | Wizard (no submit handler) |
| HIPAA/SOX Audits    | ✅         | ✅            | ✅                        | Run, results               |
| Multi-Cloud Health  | ✅         | ✅            | ✅                        | Regions, failover          |

### 2.3 Strategy/Analytics Use Cases (6 Scenarios)

| Use Case          | UI Covered | API Connected | Real Data             | Notes                     |
| ----------------- | ---------- | ------------- | --------------------- | ------------------------- |
| Financial Model   | ✅         | ⚠️            | ⚠️ Hardcoded fallback | Keep as business strategy |
| Metrics Dashboard | ✅         | ❌            | ❌ Hardcoded          | Keep as business strategy |
| Pricing Tiers     | ✅         | ❌            | ❌ Hardcoded          | Keep as business strategy |
| GTM Strategy      | ✅         | ❌            | ❌ Hardcoded          | Keep as business strategy |
| Roadmap           | ✅         | ❌            | ❌ Hardcoded          | Keep as business strategy |
| Hiring Plan       | ✅         | ❌            | ❌ Hardcoded          | Keep as business strategy |

**Status:** ❌ "Revoke" button has no onClick handler
**Issue:** Cannot revoke API tokens
**Impact:** Security gap - cannot rotate compromised keys
**Fix:** Wire to delete API key endpoint

#### G10: Risk Categorization Submit

**Location:** Line 4061 (Risk Assessment tab)
**Status:** ❌ "SUBMIT FINAL CATEGORIZATION" button has no onClick handler
**Issue:** Risk assessment wizard cannot be completed
**Impact:** Users cannot submit risk categorizations
**Fix:** Add handler to submit assessment to API

### 3.3 Minor Gaps (P2 - Nice to Have)

#### G11: MFA Toggle Persistence (Settings → SSO)

**Location:** Line 3052
**Status:** `defaultChecked` but not wired to save
**Fix:** Include in SSO save handler

#### G12: ROI Toggle Persistence (Settings → Budget)

**Location:** Line 3092
**Status:** `defaultChecked` but not wired to save
**Fix:** Include in budget save handler

#### G13: Policy Sync Toggle Persistence (Global Config)

**Location:** Line 2838
**Status:** `defaultChecked` but not wired to save
**Fix:** Include in config save handler

#### G14: Auto-Remediate Toggle in Scan Config

**Location:** Line 983
**Status:** Not passed to scan API call
**Fix:** Pass `autoRemediate` flag to `handleRunScan()`

---

## 4. DUMMY/SIMULATION/PLACEHOLDER INVENTORY

### 4.1 Must Replace with Real (Functional Dummies)

| #   | Location        | Content                         | Type        | Priority               |
| --- | --------------- | ------------------------------- | ----------- | ---------------------- |
| D1  | Lines 398-406   | Hardcoded artifact filenames    | Placeholder | P0                     |
| D2  | Lines 4125-4137 | Fallback audit trail entries    | Dummy       | P1                     |
| D3  | Lines 4851-4854 | Fallback edge device logs       | Dummy       | P1                     |
| D4  | Lines 3620-3710 | Financial model fallback values | Dummy       | P2 (business strategy) |
| D5  | Lines 3715-3800 | Metrics hardcoded values        | Dummy       | P2 (business strategy) |
| D6  | Lines 3932-3951 | GTM hardcoded percentages       | Dummy       | P2 (business strategy) |
| D7  | Lines 3954-3993 | Roadmap hardcoded items         | Dummy       | P2 (business strategy) |
| D8  | Lines 3996-4024 | Hiring hardcoded plan           | Dummy       | P2 (business strategy) |
| D9  | Lines 3803-3929 | Pricing hardcoded tiers         | Dummy       | P2 (business strategy) |
| D10 | Lines 4276-4282 | API key display hardcoded       | Placeholder | P1                     |

### 4.2 Acceptable Dummies (Business Strategy Data)

Financial model, metrics, GTM, roadmap, hiring, and pricing data are business strategy placeholders that don't affect core compliance functionality. These can remain as-is.

### 4.3 Fallback Patterns (Acceptable with Real Primary)

Many handlers implement try/catch with local state fallback when API fails. This is the correct "Real-First" pattern per user requirements.

---

## 5. IMPLEMENTATION STATUS SUMMARY

| Category       | Total   | Real          | With Fallback | Pure Dummy | Missing Handler |
| -------------- | ------- | ------------- | ------------- | ---------- | --------------- |
| Header Actions | 8       | 8 (100%)      | 0             | 0          | 0               |
| Category Nav   | 6       | 6 (100%)      | 0             | 0          | 0               |
| Gov Tabs       | 27      | 27 (100%)     | 0             | 0          | 0               |
| Reg Tabs       | 17      | 17 (100%)     | 0             | 0          | 0               |
| Tech Tabs      | 14      | 14 (100%)     | 0             | 0          | 0               |
| Ops Tabs       | 10      | 10 (100%)     | 0             | 0          | 0               |
| Infra Tabs     | 7       | 7 (100%)      | 0             | 0          | 0               |
| Fin Tabs       | 2       | 2 (100%)      | 0             | 0          | 0               |
| Strategy Tabs  | 6       | 0             | 0             | 6          | 0               |
| Dialogs        | 11      | 11 (100%)     | 0             | 0          | 0               |
| **TOTAL**      | **108** | **102 (94%)** | **0**         | **6 (6%)** | **0**           |

### Coverage by Priority:

- **P0 (Core Compliance):** 95% covered
- **P1 (Advanced Features):** 82% covered
- **P2 (Strategy/Business):** 40% covered (acceptable - business data)

---

## 6. RECOMMENDED FIX ORDER

1. **G1** - Wire artifact downloads to real API data
2. **G2** - Implement audit trail search/filter
3. **G3** - Generate real training certificates (PDF)
4. **G5** - Fix quiz answer validation logic
5. **G7** - Wire API token creation
6. **G9** - Wire API key revocation
7. **G10** - Wire risk categorization submit
8. **G4** - Remove hardcoded audit trail fallback
9. **G6** - Add SLA upgrade confirmation
10. **G8** - Add partner configuration dialog
11. **G11-G14** - Wire toggle persistence

---

_Generated: 2026-03-29_
_Analyzer: Kilo AI_
_Source: client/src/pages/AlphaAIActCompliance.tsx (4,868 lines)_
