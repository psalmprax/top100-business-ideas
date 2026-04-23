"""Centralized Seeding logic for AlphaHecta Core"""

from datetime import datetime
from sqlmodel import Session, select
from app.core.models import (
    ComplianceArticle,
    SLAAgreement,
    PartnerIntegration,
    LocalizationConfig,
    HealingConfiguration,
    SystemSetting,
    OnPremDeployment
)

def seed_all(session: Session):
    """Seed all tables if they are empty"""
    
    # 1. Compliance Articles
    if not session.exec(select(ComplianceArticle)).first():
        articles = [
            ComplianceArticle(
                article="Article 5",
                title="Unacceptable Risk AI Systems",
                description="Prohibited AI systems",
                risk="unacceptable",
                status="compliant",
            ),
            ComplianceArticle(
                article="Article 9",
                title="Risk Management System",
                description="Requirements for risk management",
                risk="high",
                status="compliant",
            ),
            ComplianceArticle(
                article="Article 10",
                title="Data Governance",
                description="Data governance requirements",
                risk="high",
                status="pending",
            ),
            ComplianceArticle(
                article="Article 11",
                title="Technical Documentation",
                description="Automated documentation generation for high-risk systems",
                risk="high",
                status="compliant",
                integration_type="docs",
                scan_type="Conformity Audit"
            ),
            ComplianceArticle(
                article="Article 14",
                title="Accuracy, Robustness and Cybersecurity",
                description="Technical robustness requirements",
                risk="high",
                status="compliant",
            ),
            ComplianceArticle(
                article="Article 50",
                title="Transparency Obligations",
                description="Information to be provided",
                risk="limited",
                status="compliant",
            ),
            ComplianceArticle(
                article="Article 61",
                title="Post-Market Monitoring",
                description="Monitoring obligations",
                risk="high",
                status="non_compliant",
            ),
        ]
        for a in articles:
            session.add(a)

    # 2. SLA Agreement
    if not session.exec(select(SLAAgreement)).first():
        session.add(SLAAgreement(
            name="Enterprise SLA",
            tier="gold",
            uptime_guarantee=99.9,
            response_time_sla=300,
            resolution_time_sla=24,
            active=True
        ))

    # 3. Partners
    if not session.exec(select(PartnerIntegration)).first():
        partners = [
            PartnerIntegration(
                name="GitHub",
                partner_type="oauth",
                permissions=["repo:read", "code:scan"],
            ),
            PartnerIntegration(
                name="Slack",
                partner_type="webhook",
                webhook_url="https://hooks.slack.com/...",
            ),
            PartnerIntegration(
                name="AWS",
                partner_type="api",
                permissions=["ec2:describe", "s3:list"],
            ),
        ]
        for p in partners:
            session.add(p)

    # 4. Localization
    if not session.exec(select(LocalizationConfig)).first():
        configs = [
            LocalizationConfig(
                language_code="en",
                region_code="US",
                timezone="America/New_York",
                currency="USD",
                compliance_framework="CCPA",
            ),
            LocalizationConfig(
                language_code="de",
                region_code="EU",
                timezone="Europe/Berlin",
                currency="EUR",
                compliance_framework="GDPR",
            ),
            LocalizationConfig(
                language_code="jp",
                region_code="APAC",
                timezone="Asia/Tokyo",
                currency="JPY",
                compliance_framework="APPI",
            ),
        ]
        for c in configs:
            session.add(c)

    # 5. Healing
    if not session.exec(select(HealingConfiguration)).first():
        healing = [
            HealingConfiguration(
                healing_type="node_restart",
                trigger_conditions={"cpu_usage": 95, "memory_usage": 90},
                recovery_actions=["restart_service", "scale_up"],
                cooldown_period=30,
                max_attempts=3,
            ),
            HealingConfiguration(
                healing_type="failover",
                trigger_conditions={"response_time": 5000, "error_rate": 0.1},
                recovery_actions=["switch_to_backup", "notify_team"],
                cooldown_period=60,
                max_attempts=2,
            ),
        ]
        for h in healing:
            session.add(h)

    # 6. System Settings
    if not session.exec(select(SystemSetting)).first():
        settings = [
            SystemSetting(
                category="security",
                setting_key="session_timeout",
                setting_value="3600",
                setting_type="number",
                description="Session timeout in seconds",
            ),
            SystemSetting(
                category="performance",
                setting_key="max_concurrent_requests",
                setting_value="100",
                setting_type="number",
                description="Maximum concurrent requests",
            ),
            SystemSetting(
                category="compliance",
                setting_key="audit_retention_days",
                setting_value="2555",
                setting_type="number",
                description="Audit log retention period",
            ),
            SystemSetting(
                category="ui",
                setting_key="theme",
                setting_value="dark",
                setting_type="string",
                description="Default UI theme",
            ),
            SystemSetting(
                category="governance",
                setting_key="forecast_token_baseline",
                setting_value="5000",
                setting_type="number",
                description="Baseline tokens for usage forecasting"
            ),
            SystemSetting(
                category="governance",
                setting_key="forecast_cost_per_token",
                setting_value="0.00002",
                setting_type="number",
                description="Average cost per token for forecasting"
            ),
            SystemSetting(
                category="governance",
                setting_key="roi_labor_savings_per_task",
                setting_value="15.0",
                setting_type="number",
                description="Estimated labor savings in USD per automated task"
            ),
            SystemSetting(
                category="agent_ops",
                setting_key="default_temperature",
                setting_value="0.7",
                setting_type="number",
                description="Default LLM temperature for new agents"
            ),
             SystemSetting(
                category="agent_ops",
                setting_key="default_max_tokens",
                setting_value="4000",
                setting_type="number",
                description="Default max tokens for new agents"
            ),
            SystemSetting(
                category="roi",
                setting_key="roi_human_review_cost",
                setting_value="45.00",
                setting_type="number",
                description="Cost of human review per unit (USD)"
            ),
            SystemSetting(
                category="roi",
                setting_key="roi_ai_detection_cost",
                setting_value="0.12",
                setting_type="number",
                description="Cost of AI detection per unit (USD)"
            ),
            SystemSetting(
                category="roi",
                setting_key="roi_fraud_loss_per_case",
                setting_value="50000.00",
                setting_type="number",
                description="Average loss prevented per detected fraud case (USD)"
            )
        ]
        for s in settings:
            session.add(s)

    # 7. On-Prem
    if not session.exec(select(OnPremDeployment)).first():
        session.add(OnPremDeployment(
            deployment_name="Primary Data Center",
            kubernetes_version="1.28.0",
            node_count=5,
            status="active",
        ))

    session.commit()
