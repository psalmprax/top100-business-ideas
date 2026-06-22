# Codebase Map

Generated: 2026-06-21T07:55:16Z | Files: 500 | Described: 0/500

<!-- gsd:codebase-meta {"generatedAt":"2026-06-21T07:55:16Z","fingerprint":"2d95765f8f7344f6d3b0da14bef47af5c0a2f726","fileCount":500,"truncated":true} -->

Note: Truncated to first 500 files. Run with higher --max-files to include all.

### (root)/

- _(24 files: 6 .md, 5 .json, 4 (no ext), 3 .yml, 2 .ts, 2 .yaml, 1 .example, 1 .txt)_

### .github/workflows/

- `.github/workflows/ci-cd.yml`

### .kilocode/

- `.kilocode/package-lock.json`

### benchmark/

- `benchmark/benchmark.py`
- `benchmark/README.md`

### bin/

- `bin/e2e-test.sh`
- `bin/redeploy-sentinel.sh`

### client/

- `client/Dockerfile`
- `client/Dockerfile.prod`
- `client/index.html`

### client/public/

- `client/public/.gitkeep`

### client/public/**manus**/

- `client/public/__manus__/debug-collector.js`

### client/src/

- `client/src/App.tsx`
- `client/src/const.ts`
- `client/src/index.css`
- `client/src/main.tsx`
- `client/src/test_fix.tsx`
- `client/src/vite-env.d.ts`

### client/src/components/

- `client/src/components/ComparisonView.tsx`
- `client/src/components/ErrorBoundary.tsx`
- `client/src/components/GlobalSearch.tsx`
- `client/src/components/IdeaDetailEnhanced.tsx`
- `client/src/components/ManusDialog.tsx`
- `client/src/components/Map.tsx`
- `client/src/components/NotificationCenter.tsx`
- `client/src/components/PerspectiveSwitcher.tsx`
- `client/src/components/UserMenu.tsx`
- `client/src/components/VentureCard.tsx`

### client/src/components/AgentOps/

- `client/src/components/AgentOps/AgentSettingsDialog.tsx`
- `client/src/components/AgentOps/Atoms.tsx`
- `client/src/components/AgentOps/Modals.tsx`
- `client/src/components/AgentOps/types.ts`

### client/src/components/AgentOps/sections/

- `client/src/components/AgentOps/sections/AgentTableSection.tsx`
- `client/src/components/AgentOps/sections/BudgetSection.tsx`
- `client/src/components/AgentOps/sections/GovernanceSection.tsx`
- `client/src/components/AgentOps/sections/InfrastructureSection.tsx`
- `client/src/components/AgentOps/sections/IntelligenceHub.tsx`
- `client/src/components/AgentOps/sections/OverviewSection.tsx`
- `client/src/components/AgentOps/sections/WebhookSection.tsx`

### client/src/components/AgentOps/sections/Governance/

- `client/src/components/AgentOps/sections/Governance/AlertsConfigSubsection.tsx`
- `client/src/components/AgentOps/sections/Governance/AuditTrailSubsection.tsx`
- `client/src/components/AgentOps/sections/Governance/ComplianceStatusSubsection.tsx`

### client/src/components/AgentOps/sections/Infrastructure/

- `client/src/components/AgentOps/sections/Infrastructure/RegionalHealthSubsection.tsx`
- `client/src/components/AgentOps/sections/Infrastructure/SelfHealingSubsection.tsx`
- `client/src/components/AgentOps/sections/Infrastructure/WebhooksSubsection.tsx`

### client/src/components/Compliance/sections/

- `client/src/components/Compliance/sections/AuditTrailSection.tsx`
- `client/src/components/Compliance/sections/BiasScanSection.tsx`
- `client/src/components/Compliance/sections/ChecklistSection.tsx`
- `client/src/components/Compliance/sections/EdgeAISection.tsx`
- `client/src/components/Compliance/sections/EnterpriseAuditsSection.tsx`
- `client/src/components/Compliance/sections/GovernanceSection.tsx`
- `client/src/components/Compliance/sections/IncidentsSection.tsx`
- `client/src/components/Compliance/sections/LiteracySection.tsx`
- `client/src/components/Compliance/sections/MonitoringSection.tsx`
- `client/src/components/Compliance/sections/PartnerPortalSection.tsx`
- `client/src/components/Compliance/sections/RedTeamSection.tsx`
- `client/src/components/Compliance/sections/RegionalComplianceSection.tsx`
- `client/src/components/Compliance/sections/RiskAssessmentSection.tsx`
- `client/src/components/Compliance/sections/SettingsSection.tsx`
- `client/src/components/Compliance/sections/ShadowAISection.tsx`
- `client/src/components/Compliance/sections/SLATiersSection.tsx`
- `client/src/components/Compliance/sections/VendorsSection.tsx`

### client/src/components/Deepfake/sections/

- `client/src/components/Deepfake/sections/BiometricsSection.tsx`

### client/src/components/DeepfakeDefense/sections/

- `client/src/components/DeepfakeDefense/sections/DetectorsSection.tsx`
- `client/src/components/DeepfakeDefense/sections/LivenessSection.tsx`
- `client/src/components/DeepfakeDefense/sections/ModelsSection.tsx`

### client/src/components/Workforce/sections/

- `client/src/components/Workforce/sections/BoardroomSection.tsx`
- `client/src/components/Workforce/sections/CashClawSection.tsx`
- `client/src/components/Workforce/sections/CommsSection.tsx`
- `client/src/components/Workforce/sections/ExecutiveSection.tsx`
- `client/src/components/Workforce/sections/FinanceSection.tsx`
- `client/src/components/Workforce/sections/GrowthSection.tsx`
- `client/src/components/Workforce/sections/HRSection.tsx`
- `client/src/components/Workforce/sections/OpsSection.tsx`

### client/src/components/Workforce/sections/subsections/

- `client/src/components/Workforce/sections/subsections/MarketingSubsection.tsx`
- `client/src/components/Workforce/sections/subsections/OutreachSubsection.tsx`
- `client/src/components/Workforce/sections/subsections/RetentionSubsection.tsx`
- `client/src/components/Workforce/sections/subsections/SalesSubsection.tsx`

### client/src/components/Workforce/ui/

- `client/src/components/Workforce/ui/AcquisitionWin.tsx`
- `client/src/components/Workforce/ui/ContentDraftItem.tsx`
- `client/src/components/Workforce/ui/DecisionItem.tsx`
- `client/src/components/Workforce/ui/DirectiveItem.tsx`
- `client/src/components/Workforce/ui/MetricCard.tsx`
- `client/src/components/Workforce/ui/NewRoleHire.tsx`
- `client/src/components/Workforce/ui/PriorityItem.tsx`
- `client/src/components/Workforce/ui/RevenueCard.tsx`
- `client/src/components/Workforce/ui/SovereignStageItem.tsx`
- `client/src/components/Workforce/ui/StrategyIterationCard.tsx`

### client/src/components/agents/

- `client/src/components/agents/AgentSquadHub.tsx`

### client/src/components/layouts/

- `client/src/components/layouts/V1_IntelligenceDashboard.tsx`
- `client/src/components/layouts/V2_SaaSBento.tsx`
- `client/src/components/layouts/V3_CyberIntelligence.tsx`

### client/src/components/skeletons/

- `client/src/components/skeletons/PremiumPlaceholder.tsx`

### client/src/components/ui/

- _(55 files: 55 .tsx)_

### client/src/contexts/

- `client/src/contexts/AuthContext.tsx`
- `client/src/contexts/PerspectiveContext.tsx`
- `client/src/contexts/ThemeContext.tsx`

### client/src/hooks/

- `client/src/hooks/useAgentOps.ts`
- `client/src/hooks/useApi.ts`
- `client/src/hooks/useBusinessIdeas.ts`
- `client/src/hooks/useComposition.ts`
- `client/src/hooks/useMobile.tsx`
- `client/src/hooks/usePanicMode.ts`
- `client/src/hooks/usePersistFn.ts`
- `client/src/hooks/useShortlist.ts`

### client/src/lib/

- `client/src/lib/api.ts`
- `client/src/lib/businessData.ts`
- `client/src/lib/exportUtils.ts`
- `client/src/lib/storage.ts`
- `client/src/lib/types.ts`
- `client/src/lib/utils.ts`

### client/src/lib/agents/

- `client/src/lib/agents/AgnosticAgentEngine.ts`

### client/src/pages/

- _(30 files: 28 .tsx, 2 .txt)_

### client/src/pages/Compliance/

- `client/src/pages/Compliance/constants.ts`
- `client/src/pages/Compliance/index.tsx`
- `client/src/pages/Compliance/types.ts`

### client/src/pages/Compliance/components/

- `client/src/pages/Compliance/components/ComplianceBadges.tsx`
- `client/src/pages/Compliance/components/ComplianceCards.tsx`
- `client/src/pages/Compliance/components/ConnectionDialog.tsx`
- `client/src/pages/Compliance/components/GenericChecklist.tsx`
- `client/src/pages/Compliance/components/ModelProfileDialog.tsx`
- `client/src/pages/Compliance/components/UploadArtifactDialog.tsx`

### client/src/pages/Compliance/hooks/

- `client/src/pages/Compliance/hooks/useCompliance.ts`

### client/src/pages/Compliance/sections/

- `client/src/pages/Compliance/sections/DashboardSection.tsx`
- `client/src/pages/Compliance/sections/ModelsSection.tsx`

### client/src/test/

- `client/src/test/alpha-products.spec.ts`
- `client/src/test/e2e-functional.spec.ts`
- `client/src/test/e2e.spec.ts`
- `client/src/test/e2e.test.ts`
- `client/src/test/sentinel_hard_integrity.spec.ts`
- `client/src/test/test_output.txt`

### client/src/tests/

- `client/src/tests/agentops-api.spec.ts`
- `client/src/tests/agentops.spec.ts`
- `client/src/tests/compliance.spec.ts`
- `client/src/tests/login.spec.ts`
- `client/src/tests/sentinel-functional.spec.ts`
- `client/src/tests/workforce.spec.ts`

### client/src/utils/

- `client/src/utils/codeSplitting.ts`

### docs/

- `docs/AGENT_SKILLS_MARKETPLACE_GUIDE.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_INFRASTRUCTURE.md`
- `docs/ideas.md`

### docs/analysis/

- `docs/analysis/AGENTOPS_SENTINEL_UI_GAP_ANALYSIS.md`
- `docs/analysis/AI_COMPLIANCE_HUB_GAP_ANALYSIS_2026.md`
- `docs/analysis/AI_COMPLIANCE_HUB_GAP_ANALYSIS.md`
- `docs/analysis/UI_BUTTON_CLICKABLE_MENU_GAP_ANALYSIS_PER_USECASE.md`
- `docs/analysis/UI_BUTTON_CLICKABLE_MENU_GAP_ANALYSIS.md`
- `docs/analysis/UI_GAP_ANALYSIS_COMPREHENSIVE.md`
- `docs/analysis/UI_GAP_ANALYSIS_FINAL.md`
- `docs/analysis/UI_GAP_ANALYSIS_SCENARIOS.md`

### docs/implementation/

- `docs/implementation/IMPLEMENTATION_GUIDE.md`
- `docs/implementation/IMPLEMENTATION_PLAN.md`
- `docs/implementation/IMPLEMENTATION_SYNC.md`

### docs/reports/

- `docs/reports/AGENT_DOCUMENTATION.md`
- `docs/reports/biometrics-verification-report.md`

### infra/deployment/

- `infra/deployment/jenkins-docker-compose.yml`
- `infra/deployment/Jenkins.Dockerfile`
- `infra/deployment/Jenkinsfile`

### packages/

- `packages/README.md`

### packages/agentops-sdk/

- `packages/agentops-sdk/package.json`
- `packages/agentops-sdk/tsconfig.json`

### packages/agentops-sdk-csharp/AgentOpsSdk/

- `packages/agentops-sdk-csharp/AgentOpsSdk/AgentOpsClient.cs`
- `packages/agentops-sdk-csharp/AgentOpsSdk/AgentOpsSdk.csproj`

### packages/agentops-sdk-go/

- `packages/agentops-sdk-go/go.mod`

### packages/agentops-sdk-go/agentops/

- `packages/agentops-sdk-go/agentops/client.go`

### packages/agentops-sdk-java/

- `packages/agentops-sdk-java/pom.xml`

### packages/agentops-sdk-java/src/main/java/agentops/

- `packages/agentops-sdk-java/src/main/java/agentops/AgentOpsClient.java`

### packages/agentops-sdk-php/

- `packages/agentops-sdk-php/composer.json`

### packages/agentops-sdk-php/src/

- `packages/agentops-sdk-php/src/AgentOpsClient.php`

### packages/agentops-sdk-python/

- `packages/agentops-sdk-python/pyproject.toml`

### packages/agentops-sdk-python/packages/agentops/

- `packages/agentops-sdk-python/packages/agentops/__init__.py`

### packages/agentops-sdk-python/packages/agentops.egg-info/

- `packages/agentops-sdk-python/packages/agentops.egg-info/dependency_links.txt`
- `packages/agentops-sdk-python/packages/agentops.egg-info/PKG-INFO`
- `packages/agentops-sdk-python/packages/agentops.egg-info/requires.txt`
- `packages/agentops-sdk-python/packages/agentops.egg-info/SOURCES.txt`
- `packages/agentops-sdk-python/packages/agentops.egg-info/top_level.txt`

### packages/agentops-sdk-ruby/

- `packages/agentops-sdk-ruby/agentops_sdk.gemspec`

### packages/agentops-sdk-ruby/lib/agentops_sdk/

- `packages/agentops-sdk-ruby/lib/agentops_sdk/client.rb`

### packages/agentops-sdk/src/

- `packages/agentops-sdk/src/index.ts`

### packages/livenesslink-sdk/

- `packages/livenesslink-sdk/package.json`
- `packages/livenesslink-sdk/tsconfig.json`

### packages/livenesslink-sdk-python/

- `packages/livenesslink-sdk-python/pyproject.toml`

### packages/livenesslink-sdk-python/packages/livenesslink/

- `packages/livenesslink-sdk-python/packages/livenesslink/__init__.py`

### packages/livenesslink-sdk/src/

- `packages/livenesslink-sdk/src/index.ts`
- `packages/livenesslink-sdk/src/panic-word.ts`
- `packages/livenesslink-sdk/src/speech-api.d.ts`

### packages/regulens-sdk/

- `packages/regulens-sdk/package.json`
- `packages/regulens-sdk/tsconfig.json`

### packages/regulens-sdk-python/

- `packages/regulens-sdk-python/pyproject.toml`

### packages/regulens-sdk-python/packages/regulens/

- `packages/regulens-sdk-python/packages/regulens/__init__.py`

### packages/regulens-sdk/src/

- `packages/regulens-sdk/src/index.ts`

### patches/

- `patches/wouter@3.7.1.patch`

### plans/

- `plans/agentops-sentinel-ui-gap-analysis-comprehensive.md`

### server/

- `server/index.ts`

### server/go/

- `server/go/api`
- `server/go/api-server`
- `server/go/Dockerfile`
- `server/go/go.mod`
- `server/go/go.sum`
- `server/go/main`

### server/go/bin/

- `server/go/bin/api`

### server/go/cmd/api/

- `server/go/cmd/api/api`
- `server/go/cmd/api/main.go`

### server/go/internal/api/routers/

- `server/go/internal/api/routers/additional.go`
- `server/go/internal/api/routers/agent_ops.go`
- `server/go/internal/api/routers/agents.go`
- `server/go/internal/api/routers/auth.go`
- `server/go/internal/api/routers/compliance.go`
- `server/go/internal/api/routers/misc.go`
- `server/go/internal/api/routers/router.go`
- `server/go/internal/api/routers/sso.go`
- `server/go/internal/api/routers/vendors.go`
- `server/go/internal/api/routers/workforce.go`

### server/go/internal/config/

- `server/go/internal/config/config.go`

### server/go/internal/database/

- `server/go/internal/database/postgres.go`
- `server/go/internal/database/redis.go`

### server/go/internal/handlers/

- _(24 files: 24 .go)_

### server/go/internal/middleware/

- `server/go/internal/middleware/access.go`
- `server/go/internal/middleware/auth.go`
- `server/go/internal/middleware/circuitbreaker.go`
- `server/go/internal/middleware/middleware_test.go`
- `server/go/internal/middleware/middleware.go`
- `server/go/internal/middleware/oauth2.go`
- `server/go/internal/middleware/ratelimit_test.go`
- `server/go/internal/middleware/ratelimit.go`
- `server/go/internal/middleware/redis_ratelimit.go`
- `server/go/internal/middleware/system_lock.go`

### server/go/internal/models/

- `server/go/internal/models/models.go`

### server/go/internal/pkg/retry/

- `server/go/internal/pkg/retry/retry.go`

### server/go/internal/repository/

- `server/go/internal/repository/denial_defense.go`
- `server/go/internal/repository/freelancer.go`
- `server/go/internal/repository/user.go`
- `server/go/internal/repository/workforce.go`

### server/go/internal/services/

- `server/go/internal/services/audit.go`
- `server/go/internal/services/auth.go`
- `server/go/internal/services/billing_service.go`
- `server/go/internal/services/email.go`
- `server/go/internal/services/integrity.go`
- `server/go/internal/services/logger_test.go`
- `server/go/internal/services/logger.go`
- `server/go/internal/services/proxy.go`
- `server/go/internal/services/stripe.go`
- `server/go/internal/services/upload.go`
- `server/go/internal/services/usage_billing.go`
- `server/go/internal/services/websocket.go`

### server/python/

- `server/python/.dockerignore`
- `server/python/alembic.ini`
- `server/python/Dockerfile`
- `server/python/Dockerfile.optimized`
- `server/python/migrate_global_id.py`
- `server/python/pytest.ini`
- `server/python/register_nodes.py`
- `server/python/requirements.txt`
- `server/python/verify_growth.py`
- `server/python/verify_ml.py`

### server/python/alembic/

- `server/python/alembic/env.py`
- `server/python/alembic/script.py.mako`

### server/python/alembic/versions/

- `server/python/alembic/versions/a1b2c3d4e5f6_initial_agnostic_hardening.py`

### server/python/app/

- `server/python/app/__init__.py`
- `server/python/app/main.py`

### server/python/app/api/

- `server/python/app/api/__init__.py`
- `server/python/app/api/agents.py`
- `server/python/app/api/alerts.py`
- `server/python/app/api/auth_verify.py`
- `server/python/app/api/compliance.py`
- `server/python/app/api/deepfake.py`
- `server/python/app/api/enterprise.py`
- `server/python/app/api/governance.py`
- `server/python/app/api/graphql.py`
- `server/python/app/api/health.py`
- `server/python/app/api/intelligence.py`
- `server/python/app/api/ml_endpoints.py`
- `server/python/app/api/security.py`
- `server/python/app/api/self_healing.py`
- `server/python/app/api/shadow_ai.py`
- `server/python/app/api/telemetry.py`
- `server/python/app/api/vendors.py`
- `server/python/app/api/venture.py`

### server/python/app/api/routers/

- `server/python/app/api/routers/__init__.py`
- `server/python/app/api/routers/agent_ops.py`
- `server/python/app/api/routers/budget.py`
- `server/python/app/api/routers/multi_cloud.py`
- `server/python/app/api/routers/streaming.py`
- `server/python/app/api/routers/webhooks.py`
- `server/python/app/api/routers/workforce.py`

### server/python/app/connectors/

- `server/python/app/connectors/github_connector.py`
- `server/python/app/connectors/supply_chain_audit.py`

### server/python/app/core/

- `server/python/app/core/config.py`
- `server/python/app/core/database.py`
- `server/python/app/core/dependencies.py`
- `server/python/app/core/logging_config.py`
- `server/python/app/core/middleware.py`
- `server/python/app/core/ml_lazy_loader.py`
- `server/python/app/core/monitoring.py`
- `server/python/app/core/resilience.py`
- `server/python/app/core/seed_compliance.py`
- `server/python/app/core/seed.py`

### server/python/app/core/models/

- `server/python/app/core/models/__init__.py`
- `server/python/app/core/models/agent_models.py`
- `server/python/app/core/models/ai_models.py`
- `server/python/app/core/models/auth_models.py`
- `server/python/app/core/models/compliance_models.py`
- `server/python/app/core/models/deepfake_models.py`
- `server/python/app/core/models/service_models.py`
- `server/python/app/core/models/workforce_models.py`

### server/python/app/ml/

- `server/python/app/ml/__init__.py`
- `server/python/app/ml/compliance_analyzer.py`
- `server/python/app/ml/deepfake_detector.py`

### server/python/app/services/

- _(36 files: 36 .py)_

### server/python/app/services/workforce/

- `server/python/app/services/workforce/__init__.py`
- `server/python/app/services/workforce/base.py`
- `server/python/app/services/workforce/cashclaw.py`
- `server/python/app/services/workforce/chat_automation.py`
- `server/python/app/services/workforce/competitor.py`
- `server/python/app/services/workforce/data_scraper.py`
- `server/python/app/services/workforce/goals.py`
- `server/python/app/services/workforce/landing_page.py`
- `server/python/app/services/workforce/lead_sourcing.py`
- `server/python/app/services/workforce/operations.py`
- `server/python/app/services/workforce/outreach.py`
- `server/python/app/services/workforce/reputation.py`
- `server/python/app/services/workforce/seo_auditor.py`

### server/python/app/tests/

- `server/python/app/tests/conftest.py`
- `server/python/app/tests/test_auth.py`

### server/python/scratch/

- `server/python/scratch/verify_semantics.py`

### shared/

- `shared/const.ts`

### tests/

- `tests/verify_agent_ops.py`

### ventures/

- `ventures/08-financial-model-template.md`
- `ventures/09-metrics-dashboard-template.md`
- `ventures/10-customer-validation-template.md`
- `ventures/11-legal-compliance-template.md`
- `ventures/12-hiring-roadmap-template.md`
- `ventures/13-investor-deck-outline-template.md`
- `ventures/14-technical-architecture-template.md`
- `ventures/15-product-roadmap-template.md`
- `ventures/16-exit-strategy-template.md`
