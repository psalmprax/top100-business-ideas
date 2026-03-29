# AgentOps Sentinel — UI Gap Analysis

**Date:** 2026-03-29
**Scope:** All buttons, clickables, menus, dialogs — per use case, per scenario
**Priority Rule:** Real implementation first; dummies/simulations/placeholders only as fallback when real fails

---

## Legend

| Status     | Meaning                                                         |
| ---------- | --------------------------------------------------------------- |
| ✅ REAL    | Handler → Backend API → DB/Service with real logic              |
| ⚠️ STUB    | Backend returns hardcoded/static/in-memory data                 |
| ❌ DUMMY   | Frontend-only simulation (toast, no API call, or mock fallback) |
| 🚫 MISSING | No backend route or handler exists                              |

---

## TAB: Overview

| #   | UI Element                    | Action       | Handler                       | Backend Status | Gap                                                                          |
| --- | ----------------------------- | ------------ | ----------------------------- | -------------- | ---------------------------------------------------------------------------- |
| 1   | MetricCard: Total Agents      | Display only | `agents.length`               | ✅ REAL        | None                                                                         |
| 2   | MetricCard: Daily Spend       | Display only | `agents.reduce(...)`          | ✅ REAL        | None                                                                         |
| 3   | MetricCard: Loops Prevented   | Display only | `agents.reduce(...)`          | ✅ REAL        | None                                                                         |
| 4   | MetricCard: Cost Saved        | Display only | `agents.reduce(...)`          | ✅ REAL        | None                                                                         |
| 5   | MetricCard: ROI Forecast      | Display only | Hardcoded "8.4x"              | ❌ DUMMY       | **Replace with `extendedApi.governance.analytics.getROI()` calculation**     |
| 6   | Budget Progress bars          | Display only | Agent data                    | ✅ REAL        | None                                                                         |
| 7   | Switch: Auto-Refine Prompts   | Toggle       | `toast.success(...)` only     | ❌ DUMMY       | **Wire to `extendedApi.selfHealing.updateHealingConfig({auto_refine})`**     |
| 8   | Switch: Safety-First Rollback | Toggle       | `toast.success(...)` only     | ❌ DUMMY       | **Wire to `extendedApi.selfHealing.updateHealingConfig({safety_rollback})`** |
| 9   | Recovery Status panel         | Display only | Hardcoded "2.4s ago", "99.2%" | ❌ DUMMY       | **Wire to `extendedApi.selfHealing.getStreamingMetrics()`**                  |

---

## TAB: Agents

| #   | UI Element                                           | Action            | Handler                                                             | Backend Status | Gap                                                                                        |
| --- | ---------------------------------------------------- | ----------------- | ------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| 1   | Tier Filter tabs (All/Strategic/Tactical/Industrial) | Filter            | Local state filter                                                  | ✅ REAL        | None (client-side)                                                                         |
| 2   | Import button                                        | Opens file picker | `handleImportAgent`                                                 | ✅ REAL        | None (client-side parse → opens create dialog)                                             |
| 3   | Advanced Filter button                               | Click             | None (no-op)                                                        | ❌ DUMMY       | **Implement filter dialog (by status, provider, env, tier)**                               |
| 4   | Deploy New Agent button                              | Opens dialog      | `setShowNewAgentDialog(true)`                                       | ✅ REAL        | None                                                                                       |
| 5   | Select All checkbox                                  | Toggle            | `setSelectedAgentIds`                                               | ✅ REAL        | None (client-side)                                                                         |
| 6   | Per-agent checkbox                                   | Toggle            | `setSelectedAgentIds`                                               | ✅ REAL        | None (client-side)                                                                         |
| 7   | Pause/Resume button                                  | Toggle status     | `toggleAgentStatus` → `agentsApi.start/stop`                        | ✅ REAL        | None                                                                                       |
| 8   | Inject Hint button                                   | Opens dialog      | `setSelectedAgentForHint`                                           | ✅ REAL        | None                                                                                       |
| 9   | Settings button                                      | Opens dialog      | `setSelectedAgent`                                                  | ⚠️ PARTIAL     | **`AgentSettingsDialog.onSave` only updates local state, doesn't call `agentsApi.update`** |
| 10  | Clone Agent (dropdown)                               | Clone config      | `handleCloneAgent`                                                  | ✅ REAL        | None (pre-fills create form)                                                               |
| 11  | Export Configuration (dropdown)                      | Download JSON     | `handleExportAgent`                                                 | ✅ REAL        | None (client-side)                                                                         |
| 12  | DECOMMISSION (dropdown)                              | Delete agent      | `handleDecommissionAgent` → `agentsApi.delete`                      | ✅ REAL        | None                                                                                       |
| 13  | Memory Optimize button                               | Optimize          | `handleOptimizeAgentMemory` → `extendedApi.agentOps.optimizeMemory` | ✅ REAL        | None                                                                                       |
| 14  | Bulk Pause                                           | Bulk action       | `handleBulkAction('pause')` → `extendedApi.agentOps.bulkAction`     | ✅ REAL        | None                                                                                       |
| 15  | Bulk Restart                                         | Bulk action       | `handleBulkAction('restart')`                                       | ✅ REAL        | None                                                                                       |
| 16  | Bulk Terminate                                       | Bulk action       | `handleBulkAction('terminate')`                                     | ✅ REAL        | None                                                                                       |
| 17  | Clear selection                                      | Reset             | `setSelectedAgentIds([])`                                           | ✅ REAL        | None (client-side)                                                                         |

### Agent Settings Dialog (opened from Agents tab)

| #   | UI Element               | Action | Handler                                     | Backend Status | Gap                                                                                                       |
| --- | ------------------------ | ------ | ------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| 18  | Agent Name input         | Edit   | Local state                                 | ⚠️ STUB        | **`onSave` only updates local state, doesn't persist to backend**                                         |
| 19  | Environment select       | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 20  | Agent Tier select        | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 21  | Org ID input             | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 22  | Persistent Memory switch | Toggle | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 23  | Provider select          | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 24  | Model select             | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 25  | Daily Budget input       | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 26  | Max Tokens input         | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 27  | Temperature slider       | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 28  | Control Webhook input    | Edit   | Local state                                 | ⚠️ STUB        | Same as above                                                                                             |
| 29  | Save Changes button      | Save   | `onSave` callback → local state update only | ❌ DUMMY       | **CRITICAL: Must call `agentsApi.update(selectedAgent.id, updatePayload)` like `handleUpdateAgent` does** |
| 30  | Cancel button            | Close  | `onOpenChange(false)`                       | ✅ REAL        | None (client-side)                                                                                        |

### New Agent Dialog

| #   | UI Element                                 | Action | Handler                                  | Backend Status | Gap                |
| --- | ------------------------------------------ | ------ | ---------------------------------------- | -------------- | ------------------ |
| 31  | Tier radio (Strategic/Tactical/Industrial) | Select | Local state + auto-set provider/model    | ✅ REAL        | None (client-side) |
| 32  | Persistent Memory switch                   | Toggle | Local state                              | ✅ REAL        | None               |
| 33  | Agent Name input                           | Edit   | Local state                              | ✅ REAL        | None               |
| 34  | Agent Framework select                     | Edit   | Local state                              | ✅ REAL        | None               |
| 35  | Framework-specific config fields           | Edit   | Local state                              | ✅ REAL        | None               |
| 36  | Environment select                         | Edit   | Local state                              | ✅ REAL        | None               |
| 37  | Org ID input                               | Edit   | Local state                              | ✅ REAL        | None               |
| 38  | Provider select                            | Edit   | Local state                              | ✅ REAL        | None               |
| 39  | Model select                               | Edit   | Local state                              | ✅ REAL        | None               |
| 40  | Daily Budget input                         | Edit   | Local state                              | ✅ REAL        | None               |
| 41  | Max Tokens input                           | Edit   | Local state                              | ✅ REAL        | None               |
| 42  | Control Webhook input                      | Edit   | Local state                              | ✅ REAL        | None               |
| 43  | Create Agent button                        | Submit | `handleCreateAgent` → `agentsApi.create` | ✅ REAL        | None               |
| 44  | Cancel button                              | Close  | `setShowNewAgentDialog(false)`           | ✅ REAL        | None               |

### Inject Hint Dialog

| #   | UI Element                  | Action | Handler                                                   | Backend Status | Gap  |
| --- | --------------------------- | ------ | --------------------------------------------------------- | -------------- | ---- |
| 45  | Hint textarea               | Edit   | Local state                                               | ✅ REAL        | None |
| 46  | Inject Priority Hint button | Submit | `handleInjectHint` → `extendedApi.selfHealing.injectHint` | ✅ REAL        | None |
| 47  | Cancel button               | Close  | `setIsHintDialogOpen(false)`                              | ✅ REAL        | None |

---

## TAB: Budget

| #   | UI Element                  | Action       | Handler                                | Backend Status | Gap                                                                                  |
| --- | --------------------------- | ------------ | -------------------------------------- | -------------- | ------------------------------------------------------------------------------------ |
| 1   | Budget rule toggle switches | Toggle       | `toggleBudgetRule` → `rulesApi.toggle` | ✅ REAL        | None                                                                                 |
| 2   | Usage Forecasting cards     | Display only | Hardcoded "$342.50", "$385.00"         | ❌ DUMMY       | **Wire to `usageForecasts` state from `extendedApi.governance.forecast.getUsage()`** |
| 3   | Cost Savings card           | Display only | Hardcoded "$2,717.60"                  | ❌ DUMMY       | **Calculate from `agents.reduce(a.metrics.costSaved)`**                              |

---

## TAB: Audit Trail

| #   | UI Element                 | Action       | Handler                                                      | Backend Status | Gap                                                                                                  |
| --- | -------------------------- | ------------ | ------------------------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Audit entry cards          | Display      | `auditLog` state from API                                    | ✅ REAL        | None                                                                                                 |
| 2   | View Forensic Trace button | Opens dialog | `setSelectedAuditEntry` → `setShowForensicTraceDialog(true)` | ⚠️ PARTIAL     | **Dialog opens but `showForensicTraceDialog` has no UI rendering — the dialog component is MISSING** |

---

## TAB: Alerts

| #   | UI Element                                 | Action  | Handler                                                           | Backend Status | Gap  |
| --- | ------------------------------------------ | ------- | ----------------------------------------------------------------- | -------------- | ---- |
| 1   | Alert toggle switches                      | Toggle  | `toggleAlert` → `extendedApi.governance.compliance.alerts.update` | ✅ REAL        | None |
| 2   | Active Vigilance Alert: Ignore button      | Ignore  | `handleIgnoreAlert` → `extendedApi.agentOps.ignoreAlert`          | ✅ REAL        | None |
| 3   | Active Vigilance Alert: Resolve Now button | Resolve | `handleResolveAlert` → `extendedApi.agentOps.resolveAlert`        | ✅ REAL        | None |

**⚠️ GAP: Active Vigilance Alerts are hardcoded** — The alerts shown (Budget Breach, Loop Detected) are static JSX, not from API. **Wire to real alert data from `alertConfigs` or a dedicated vigilance endpoint.**

---

## TAB: Infrastructure

| #   | UI Element                    | Action        | Handler                                                          | Backend Status | Gap                                                                           |
| --- | ----------------------------- | ------------- | ---------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------- |
| 1   | App Store button              | External link | `<a href="https://apps.apple.com/...">`                          | ❌ DUMMY       | **Link points to non-existent app. Either remove or add "Coming Soon" label** |
| 2   | Google Play button            | External link | `<a href="https://play.google.com/...">`                         | ❌ DUMMY       | Same as above                                                                 |
| 3   | QR Code display               | Display only  | Static placeholder                                               | ❌ DUMMY       | **Generate real QR code for session pairing or remove**                       |
| 4   | Multi-Cloud Health regions    | Display       | `multiCloudStatus.regions` from API                              | ✅ REAL        | None                                                                          |
| 5   | Test Regional Failover button | Trigger       | `handleTriggerFailover` → `extendedApi.agentOps.triggerFailover` | ✅ REAL        | None                                                                          |
| 6   | CONFIGURE PROXY RULES button  | Opens dialog  | `setShowProxyConfigDialog(true)`                                 | ✅ REAL        | None                                                                          |
| 7   | VIEW HEALING DASHBOARD button | Opens dialog  | `handleViewSnapshots` → `extendedApi.agentOps.getSnapshots`      | ✅ REAL        | None                                                                          |
| 8   | Real-Time Streaming Metrics   | Display       | `liveMetrics` state via polling                                  | ✅ REAL        | None                                                                          |
| 9   | Configure Stream button       | Click         | `toast.info(...)` only                                           | ❌ DUMMY       | **Implement streaming configuration dialog**                                  |

### Proxy Config Dialog

| #   | UI Element                  | Action | Handler                                                             | Backend Status | Gap  |
| --- | --------------------------- | ------ | ------------------------------------------------------------------- | -------------- | ---- |
| 10  | Region select               | Edit   | Local state                                                         | ✅ REAL        | None |
| 11  | Apply Routing Config button | Submit | `handleConfigureProxyRules` → `extendedApi.agentOps.configureProxy` | ✅ REAL        | None |
| 12  | Cancel button               | Close  | `setShowProxyConfigDialog(false)`                                   | ✅ REAL        | None |

### Snapshots Dialog

| #   | UI Element                 | Action   | Handler                                                            | Backend Status | Gap  |
| --- | -------------------------- | -------- | ------------------------------------------------------------------ | -------------- | ---- |
| 13  | Snapshot table rows        | Display  | `snapshots` state from API                                         | ✅ REAL        | None |
| 14  | ROLLBACK button            | Rollback | `handleRollbackSnapshot` → `extendedApi.agentOps.rollbackSnapshot` | ✅ REAL        | None |
| 15  | Capture Fresh State button | Capture  | `handleCaptureSnapshot` → `extendedApi.agentOps.captureSnapshot`   | ✅ REAL        | None |
| 16  | Close button               | Close    | `setShowSnapshotsDialog(false)`                                    | ✅ REAL        | None |

### Mobile Applications Card

| #   | UI Element        | Action        | Handler    | Backend Status | Gap        |
| --- | ----------------- | ------------- | ---------- | -------------- | ---------- |
| 17  | App Store button  | External link | `<a href>` | ❌ DUMMY       | Same as #1 |
| 18  | Play Store button | External link | `<a href>` | ❌ DUMMY       | Same as #2 |

---

## TAB: Webhooks

| #   | UI Element            | Action       | Handler                                     | Backend Status | Gap  |
| --- | --------------------- | ------------ | ------------------------------------------- | -------------- | ---- |
| 1   | Add Webhook button    | Opens dialog | `setShowWebhookDialog(true)`                | ✅ REAL        | None |
| 2   | Webhook Test button   | Test         | Inline `extendedApi.agentOps.testWebhook`   | ✅ REAL        | None |
| 3   | Webhook Delete button | Delete       | Inline `extendedApi.agentOps.deleteWebhook` | ✅ REAL        | None |

### Add Webhook Dialog

| #   | UI Element                                                                    | Action | Handler                                                          | Backend Status | Gap  |
| --- | ----------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- | -------------- | ---- |
| 4   | Channel Name input                                                            | Edit   | Local state                                                      | ✅ REAL        | None |
| 5   | Endpoint URL input                                                            | Edit   | Local state                                                      | ✅ REAL        | None |
| 6   | Event checkboxes (AGENT_ERROR, BUDGET_EXCEEDED, LOOP_DETECTED, FAILOVER_INIT) | Toggle | Local state                                                      | ✅ REAL        | None |
| 7   | Add Webhook button                                                            | Submit | `handleRegisterWebhook` → `extendedApi.agentOps.registerWebhook` | ✅ REAL        | None |
| 8   | Cancel button                                                                 | Close  | `setShowWebhookDialog(false)`                                    | ✅ REAL        | None |

---

## TAB: On-Prem

| #   | UI Element                    | Action            | Handler                                                                             | Backend Status | Gap                                                  |
| --- | ----------------------------- | ----------------- | ----------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| 1   | Docker Compose button         | Generate manifest | Inline `extendedApi.onPrem.manifest("docker-compose")`                              | ✅ REAL        | None                                                 |
| 2   | Helm Chart button             | Generate manifest | Inline `extendedApi.onPrem.manifest("helm")`                                        | ✅ REAL        | None                                                 |
| 3   | Zero-Knowledge Logging switch | Toggle            | `defaultChecked` — no handler                                                       | ❌ DUMMY       | **Wire to `extendedApi.governance.settings.update`** |
| 4   | PII Redaction Engine switch   | Toggle            | `defaultChecked` — no handler                                                       | ❌ DUMMY       | **Wire to `extendedApi.governance.settings.update`** |
| 5   | On-Prem Deployments table     | Display           | `onPremDeployments` from API                                                        | ✅ REAL        | None                                                 |
| 6   | Upgrade button                | Trigger           | `handleOnPremAction(id, "upgrade")` → `extendedApi.governance.onPrem.triggerAction` | ✅ REAL        | None                                                 |
| 7   | Scale button                  | Trigger           | `handleOnPremAction(id, "scale")`                                                   | ✅ REAL        | None                                                 |

---

## TAB: Compliance

| #   | UI Element                        | Action  | Handler                                                      | Backend Status | Gap  |
| --- | --------------------------------- | ------- | ------------------------------------------------------------ | -------------- | ---- |
| 1   | Overall Compliance metric         | Display | `complianceDashboard` from API                               | ✅ REAL        | None |
| 2   | Run HIPAA Compliance Audit button | Trigger | `handleRunHipaaAudit` → `extendedApi.agentOps.runHipaaAudit` | ✅ REAL        | None |
| 3   | HIPAA status badge                | Display | `complianceStatus.hipaa`                                     | ✅ REAL        | None |
| 4   | Run SOX Financial Audit button    | Trigger | `handleRunSoxAudit` → `extendedApi.agentOps.runSoxAudit`     | ✅ REAL        | None |
| 5   | SOX status badge                  | Display | `complianceStatus.sox`                                       | ✅ REAL        | None |
| 6   | EU AI Act Article table           | Display | `complianceDashboard.recent_assessments` from API            | ✅ REAL        | None |

---

## TAB: SLA

| #   | UI Element                                            | Action   | Handler                                         | Backend Status | Gap                                                              |
| --- | ----------------------------------------------------- | -------- | ----------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| 1   | SLA Metrics cards                                     | Display  | `slaDashboard` from API with hardcoded fallback | ⚠️ PARTIAL     | **Backend returns real data but with hardcoded fallback values** |
| 2   | Activate Tier buttons (Standard/Enterprise/Sovereign) | Activate | Inline `extendedApi.enterprise.updateSlaTier`   | ✅ REAL        | None                                                             |

---

## TAB: SSO

| #   | UI Element                               | Action         | Handler                                                             | Backend Status | Gap                                      |
| --- | ---------------------------------------- | -------------- | ------------------------------------------------------------------- | -------------- | ---------------------------------------- |
| 1   | Connect Okta button                      | OAuth redirect | `handleConnectProvider('okta')` → `extendedApi.sso.connectProvider` | ✅ REAL        | None                                     |
| 2   | Connect Azure AD button                  | OAuth redirect | `handleConnectProvider('azure')`                                    | ✅ REAL        | None                                     |
| 3   | Connect Google button                    | OAuth redirect | `handleConnectProvider('google')`                                   | ✅ REAL        | None                                     |
| 4   | SSO URL input                            | Edit           | `ssoConfig.sso_url` state                                           | ✅ REAL        | None                                     |
| 5   | Certificate textarea                     | Edit           | `ssoConfig.certificate` state                                       | ✅ REAL        | None                                     |
| 6   | Save SAML Config button                  | Submit         | `handleSaveSAMLConfig` → `extendedApi.sso.saveConfig`               | ✅ REAL        | None                                     |
| 7   | SSO Handshake button                     | Trigger        | `handleSSOHandshake` → `extendedApi.sso.handshake`                  | ✅ REAL        | None                                     |
| 8   | Sync Now button (User Provisioning)      | Click          | No handler attached                                                 | ❌ DUMMY       | **Wire to SCIM sync endpoint or remove** |
| 9   | Export Logs button                       | Download       | `handleDownload` with audit log data                                | ✅ REAL        | None (client-side)                       |
| 10  | SSO Providers display (connected status) | Display        | `connectedProviders` from API                                       | ✅ REAL        | None                                     |

---

## TAB: Partner Portal

| #   | UI Element                    | Action  | Handler                                       | Backend Status | Gap                                                                          |
| --- | ----------------------------- | ------- | --------------------------------------------- | -------------- | ---------------------------------------------------------------------------- |
| 1   | Provision Client Space button | Click   | No handler attached                           | ❌ DUMMY       | **Wire to `handleProvisionClient` → `extendedApi.agentOps.provisionClient`** |
| 2   | Update Assets button          | Click   | No handler attached                           | ❌ DUMMY       | **Implement brand asset upload or remove**                                   |
| 3   | Partner Sync buttons          | Sync    | Inline `extendedApi.governance.partners.sync` | ✅ REAL        | None                                                                         |
| 4   | Partners table                | Display | `partners` state from API                     | ✅ REAL        | None                                                                         |

---

## TAB: Forecast

| #   | UI Element             | Action  | Handler                   | Backend Status | Gap  |
| --- | ---------------------- | ------- | ------------------------- | -------------- | ---- |
| 1   | Usage Projection chart | Display | `usageForecasts` from API | ✅ REAL        | None |
| 2   | Forecast Summary cards | Display | `usageForecasts` from API | ✅ REAL        | None |

---

## TAB: ROI

| #   | UI Element             | Action  | Handler                         | Backend Status | Gap  |
| --- | ---------------------- | ------- | ------------------------------- | -------------- | ---- |
| 1   | ROI Metric cards       | Display | `roiMetrics` from API           | ✅ REAL        | None |
| 2   | Total Realized Savings | Display | `roiMetrics.find(...)` from API | ✅ REAL        | None |

---

## TAB: L10n (Localization)

| #   | UI Element        | Action  | Handler                                                                         | Backend Status | Gap  |
| --- | ----------------- | ------- | ------------------------------------------------------------------------------- | -------------- | ---- |
| 1   | Locale cards      | Display | `localizationConfigs` from API                                                  | ✅ REAL        | None |
| 2   | Add Locale button | Deploy  | `handleDeployLanguage("Japanese (JP)")` → `extendedApi.agentOps.deployLanguage` | ✅ REAL        | None |

---

## TAB: Self-Heal

| #   | UI Element                          | Action       | Handler                                                                                         | Backend Status | Gap  |
| --- | ----------------------------------- | ------------ | ----------------------------------------------------------------------------------------------- | -------------- | ---- |
| 1   | Auto-Rollback Threshold slider      | Adjust       | `handleUpdateSetting("healing_threshold", val)` → `extendedApi.selfHealing.updateHealingConfig` | ✅ REAL        | None |
| 2   | Configure Temporal Snapshots button | Opens dialog | `setShowSnapshotsDialog(true)`                                                                  | ✅ REAL        | None |
| 3   | Auto-Refine Prompts switch          | Toggle       | `extendedApi.selfHealing.updateHealingConfig`                                                   | ✅ REAL        | None |
| 4   | Safety-First Rollback switch        | Toggle       | `extendedApi.selfHealing.updateHealingConfig`                                                   | ✅ REAL        | None |
| 5   | Healing History list                | Display      | `selfHealingEvents` from API                                                                    | ✅ REAL        | None |

---

## TAB: Strategy (Venture)

| #   | UI Element                      | Action  | Handler                                                                  | Backend Status | Gap                                            |
| --- | ------------------------------- | ------- | ------------------------------------------------------------------------ | -------------- | ---------------------------------------------- |
| 1   | Strategic Insight cards         | Display | `strategicInsights` from API                                             | ✅ REAL        | None                                           |
| 2   | REALIZE IMPACT button           | Trigger | `handleRealizeImpact` → `extendedApi.governance.analytics.realizeImpact` | ✅ REAL        | None                                           |
| 3   | Autonomous Strategy Engine card | Display | Hardcoded "Model: Stratos-V1" placeholder                                | ❌ DUMMY       | **Implement or clearly mark as "Coming Soon"** |

---

## TAB: Models

| #   | UI Element                          | Action       | Handler                                  | Backend Status | Gap                                                     |
| --- | ----------------------------------- | ------------ | ---------------------------------------- | -------------- | ------------------------------------------------------- |
| 1   | LLM Provider table                  | Display      | `llmConfigs` from API                    | ✅ REAL        | None                                                    |
| 2   | Add Provider button                 | Opens dialog | `setShowNewModelDialog(true)`            | ✅ REAL        | None                                                    |
| 3   | Settings icon button (per provider) | Click        | No handler                               | ❌ DUMMY       | **Implement provider settings dialog or remove button** |
| 4   | Failover button (per provider)      | Trigger      | `handleTriggerFailover(config.id)`       | ✅ REAL        | None                                                    |
| 5   | Test Failover (chain) button        | Trigger      | `handleTriggerFailover("aws-us-east-1")` | ✅ REAL        | None                                                    |

### Add Provider Dialog

| #   | UI Element                   | Action | Handler                                                        | Backend Status | Gap                                                              |
| --- | ---------------------------- | ------ | -------------------------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| 6   | Provider select              | Edit   | Local state                                                    | ✅ REAL        | None                                                             |
| 7   | Deployment Type select       | Edit   | Local state                                                    | ⚠️ PARTIAL     | **Value not used in `handleRegisterModel` — backend ignores it** |
| 8   | Model Name input             | Edit   | Local state                                                    | ✅ REAL        | None                                                             |
| 9   | API Handshake Key input      | Edit   | Local state                                                    | ✅ REAL        | None                                                             |
| 10  | Sentinel Governance checkbox | Toggle | `defaultChecked` — not wired                                   | ❌ DUMMY       | **Pass to `handleRegisterModel` and backend**                    |
| 11  | Verify & Register button     | Submit | `handleRegisterModel` → `extendedApi.agentOps.updateLLMConfig` | ✅ REAL        | None                                                             |

---

## TAB: Settings

| #   | UI Element                      | Action  | Handler                                                               | Backend Status | Gap                                 |
| --- | ------------------------------- | ------- | --------------------------------------------------------------------- | -------------- | ----------------------------------- |
| 1   | Context Compression switch      | Toggle  | `handleToggleCompression` → `extendedApi.agentOps.updateOptimization` | ✅ REAL        | None                                |
| 2   | Optimize Store button           | Trigger | `handleRunDiagnostics(agentId, 'compress')`                           | ⚠️ STUB        | **Backend returns static response** |
| 3   | Flush Cache button              | Trigger | `handleRunDiagnostics(agentId, 'dump')`                               | ⚠️ STUB        | **Backend returns static response** |
| 4   | System Settings switches/inputs | Edit    | `handleUpdateSetting` → `extendedApi.governance.settings.update`      | ✅ REAL        | None                                |

---

## TAB: Developers (hidden tab — not in navigation but rendered)

| #   | UI Element                             | Action       | Handler                                                                     | Backend Status | Gap                                                                              |
| --- | -------------------------------------- | ------------ | --------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------- |
| 1   | GraphQL textarea                       | Edit         | Local state                                                                 | ✅ REAL        | None (client-side)                                                               |
| 2   | Execute Query button                   | Run query    | `handleGraphqlQuery` → `extendedApi.graphql`                                | ⚠️ STUB        | **Backend returns hardcoded mock based on query string**                         |
| 3   | Gateway Proxy switch                   | Toggle       | `defaultChecked` — no handler                                               | ❌ DUMMY       | **Wire to `extendedApi.agentOps.setGqlProxyConfig`**                             |
| 4   | Copy API Key buttons                   | Copy         | `toast.success("Key copied")`                                               | ❌ DUMMY       | **Implement real clipboard copy or remove**                                      |
| 5   | ROTATE NEW LIVE KEY button             | Rotate       | `handleRotateApiKey` → `extendedApi.post('/agent-ops/security/rotate-key')` | ⚠️ STUB        | **Backend generates key but doesn't persist**                                    |
| 6   | OPEN FULL DOCUMENTATION button         | Click        | `toast.info("...air-gapped")`                                               | ❌ DUMMY       | **Link to actual Swagger/OpenAPI docs**                                          |
| 7   | GDPR Right to Be Forgotten switch      | Toggle       | `defaultChecked` — no handler                                               | ❌ DUMMY       | **Wire to settings API**                                                         |
| 8   | MiCA Crypto Asset Guard switch         | Toggle       | `defaultChecked` — no handler                                               | ❌ DUMMY       | **Wire to settings API**                                                         |
| 9   | DOWNLOAD COMPLIANCE CERTIFICATE button | Download PDF | `handleDownload` (client-side PDF gen)                                      | ⚠️ PARTIAL     | **PDF is generated client-side with static content — should fetch from backend** |

---

## Header Actions

| #   | UI Element            | Action       | Handler                              | Backend Status | Gap                                                             |
| --- | --------------------- | ------------ | ------------------------------------ | -------------- | --------------------------------------------------------------- |
| 1   | Alert Settings button | Navigate     | `setActiveTab("alerts")`             | ✅ REAL        | None (client-side nav)                                          |
| 2   | Budget Rules button   | Navigate     | `setActiveTab("budget")`             | ✅ REAL        | None (client-side nav)                                          |
| 3   | Export Data button    | Download CSV | `handleExportData` (client-side CSV) | ⚠️ PARTIAL     | **CSV is built from local state — should fetch fresh from API** |
| 4   | New Agent button      | Opens dialog | `setShowNewAgentDialog(true)`        | ✅ REAL        | None                                                            |
| 5   | UserMenu              | Various      | Separate component                   | ✅ REAL        | None                                                            |

---

## WebSocket Real-time

| #   | Event Type                  | Handler                    | Status  | Gap  |
| --- | --------------------------- | -------------------------- | ------- | ---- |
| 1   | `agent_update`              | Updates agent in state     | ✅ REAL | None |
| 2   | `audit_log` / `audit_entry` | Prepends to audit log      | ✅ REAL | None |
| 3   | `live_metrics`              | Updates live metrics       | ✅ REAL | None |
| 4   | `self_healing_event`        | Prepends to healing events | ✅ REAL | None |

---

## SUMMARY OF CRITICAL GAPS

### Priority 1 — User-Facing Broken/Confusing (Must Fix)

| #   | Issue                                            | Location                                    | Fix                                                                                         |
| --- | ------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | **Agent Settings Save doesn't persist**          | Agents tab → Settings dialog → Save Changes | Wire `onSave` to call `agentsApi.update()` instead of only updating local state             |
| 2   | **Forensic Trace Dialog missing**                | Audit tab → View Forensic Trace             | Create `ForensicTraceDialog` component and render it when `showForensicTraceDialog` is true |
| 3   | **Active Vigilance Alerts are hardcoded**        | Alerts tab                                  | Replace hardcoded alert JSX with dynamic data from `alertConfigs` or dedicated endpoint     |
| 4   | **Provision Client Space button has no handler** | Partner Portal tab                          | Wire to `handleProvisionClient`                                                             |
| 5   | **Sync Now button has no handler**               | SSO tab → User Provisioning                 | Wire to SCIM sync endpoint or remove                                                        |
| 6   | **Provider Settings icon button has no handler** | Models tab → LLM table                      | Implement provider config dialog or remove                                                  |

### Priority 2 — Dummy Content That Should Be Real

| #   | Issue                                                            | Location           | Fix                                                   |
| --- | ---------------------------------------------------------------- | ------------------ | ----------------------------------------------------- |
| 7   | ROI Forecast card hardcoded "8.4x"                               | Overview tab       | Calculate from `roiMetrics` API data                  |
| 8   | Auto-Refine/Safety switches only toast                           | Overview tab       | Wire to `extendedApi.selfHealing.updateHealingConfig` |
| 9   | Recovery Status panel hardcoded                                  | Overview tab       | Wire to `liveMetrics` / `selfHealingEvents`           |
| 10  | Budget Usage Forecasting hardcoded values                        | Budget tab         | Wire to `usageForecasts` state                        |
| 11  | Active Vigilance Alerts hardcoded                                | Alerts tab         | Fetch from backend                                    |
| 12  | Mobile App Store/Play links point to non-existent apps           | Infrastructure tab | Remove or mark "Coming Soon"                          |
| 13  | QR Code is static placeholder                                    | Infrastructure tab | Generate real QR or remove                            |
| 14  | Configure Stream button only toasts                              | Infrastructure tab | Implement streaming config dialog                     |
| 15  | Zero-Knowledge Logging / PII Redaction switches have no handlers | On-Prem tab        | Wire to settings API                                  |
| 16  | Autonomous Strategy Engine placeholder                           | Strategy tab       | Implement or mark "Coming Soon"                       |
| 17  | GraphQL proxy returns hardcoded mocks                            | Developers tab     | Implement real GraphQL resolver                       |
| 18  | API Key rotation not persisted                                   | Developers tab     | Backend must persist rotated keys                     |
| 19  | GDPR/MiCA switches have no handlers                              | Developers tab     | Wire to settings API                                  |

### Priority 3 — Backend Stubs Requiring Real Implementation

| #   | Issue                                   | Endpoint                              | Fix                                                   |
| --- | --------------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| 20  | Agent memory endpoint returns empty     | `GET /agents/{id}/memory`             | Implement real memory retrieval from persistent store |
| 21  | Agent dump/compress returns static      | `POST /agents/{id}/dump`, `/compress` | Implement real memory dump/compression                |
| 22  | Self-healing config POST returns static | `POST /self-healing/config`           | Persist to DB                                         |
| 23  | Slack integration returns static        | `POST /integrations/slack`            | Implement real Slack webhook integration              |
| 24  | Notifications test returns static       | `POST /notifications/test`            | Send real test notification                           |
| 25  | Security key rotation not persisted     | `POST /agent-ops/security/rotate-key` | Store in DB/config                                    |
| 26  | GraphQL endpoint hardcoded              | `POST /graphql-proxy`                 | Implement real GraphQL schema/resolver                |

---

## TOTAL COUNTS

| Category                          | Count    |
| --------------------------------- | -------- |
| **Total UI Interactive Elements** | 115      |
| ✅ Fully REAL                     | 78 (68%) |
| ⚠️ PARTIAL / STUB                 | 14 (12%) |
| ❌ DUMMY (no real backend)        | 23 (20%) |
| 🚫 MISSING                        | 0 (0%)   |
