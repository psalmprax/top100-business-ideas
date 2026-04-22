import uuid
from datetime import datetime
from sqlmodel import Session
from app.core.database import engine
from app.core.models import ComplianceChecklistItem, Vendor

def seed_compliance():
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    
    items = [
        # SLA Tiers (Governance)
        ComplianceChecklistItem(
            category="sla",
            section="Governance",
            title="Platinum Tier: High Availability",
            description="Verify that agent responsiveness meets the 99.9% uptime requirement for Platinum customers.",
            status="compliant",
        ),
        ComplianceChecklistItem(
            category="sla",
            section="Governance",
            title="Token Refresh Latency",
            description="Audit token authentication refresh cycle to ensure <200ms turnaround.",
            status="pending",
        ),
        ComplianceChecklistItem(
            category="sla",
            section="Governance",
            title="Escalated Support Response",
            description="Verify that all P1 incidents for priority tiers have a human responder assigned within 15 minutes.",
            status="compliant",
        ),

        # Risk Assessment (Governance)
        ComplianceChecklistItem(
            category="risk",
            section="Governance",
            title="Adversarial Prompt Injection Scan",
            description="Systematic audit of agent response boundaries against LlamaGuard-3 filters.",
            status="compliant",
        ),
        ComplianceChecklistItem(
            category="risk",
            section="Governance",
            title="Data Exfiltration Boundary",
            description="Verify that agents cannot egress data to unwhitelisted domains.",
            status="pending",
        ),
        ComplianceChecklistItem(
            category="risk",
            section="Governance",
            title="Model Hallucination Audit",
            description="Cross-verify agent outputs against a verified facts database to detect high-drift confidence.",
            status="non_compliant",
        ),

        # Audit Trail (Governance)
        ComplianceChecklistItem(
            category="audit-trail",
            section="Governance",
            title="Human-in-the-Loop Traceability",
            description="Verify that every autonomous intervention has a corresponding 'HINT_INJECTION' or 'APPROVAL' log.",
            status="compliant",
        ),
        ComplianceChecklistItem(
            category="audit-trail",
            section="Governance",
            title="Budget Overrun Audit",
            description="Cross-reference AgentAuditLog against billing quotas for the last 24h.",
            status="pending",
        ),
        ComplianceChecklistItem(
            category="audit-trail",
            section="Governance",
            title="Immutable Log Hashing",
            description="Verify that all forensic traces are signed and hashed to prevent administrative tampering.",
            status="compliant",
        ),

        # Regional (Regulatory)
        ComplianceChecklistItem(
            category="regional",
            section="Regulatory",
            title="GDPR Data Residency",
            description="Ensure that all PII used for training or fine-tuning remains within the EU sovereign boundary.",
            status="compliant",
        ),
        ComplianceChecklistItem(
            category="regional",
            section="Regulatory",
            title="CCPA Access Controls",
            description="Verify that US-based users can invoke 'Right to be Forgotten' triggers across the workforce.",
            status="pending",
        ),

        # Documentation (Regulatory)
        ComplianceChecklistItem(
            category="docs",
            section="Regulatory",
            title="Annex IV Technical Folder",
            description="Ensure all high-risk systems have a dynamically generated and timestamped Annex IV dossier.",
            status="pending",
        ),
        ComplianceChecklistItem(
            category="docs",
            section="Regulatory",
            title="Article 13 Transparency Sheet",
            description="Public-facing disclosure documentation for system capabilities and limitations.",
            status="compliant",
        ),

        # Reports (Regulatory)
        ComplianceChecklistItem(
            category="reports",
            section="Regulatory",
            title="Monthly Compliance Summary",
            description="Automated report summarizing all incidents, interventions, and audit results for the previous 30 days.",
            status="pending",
        ),

        # Bias Scan (Technical)
        ComplianceChecklistItem(
            category="bias",
            section="Technical",
            title="Demographic Parity Audit",
            description="Scan model predictions for disparate impact across protected demographic groups.",
            status="compliant",
        ),

        # Budget Rules (Finance)
        ComplianceChecklistItem(
            category="budget",
            section="Finance",
            title="Dynamic Quota Enforcement",
            description="Verify that the BillingService correctly pauses agents when they reach 100% of their daily budget.",
            status="compliant",
        ),
    ]

    vendors = [
        Vendor(
            name="OpenAI",
            type="llm",
            category="primary_ai",
            risk_level="low",
            status="vetted",
            website="https://openai.com",
            contact_email="compliance@openai.com",
        ),
        Vendor(
            name="Anthropic",
            type="llm",
            category="primary_ai",
            risk_level="low",
            status="vetted",
            website="https://anthropic.com",
            contact_email="legal@anthropic.com",
        ),
        Vendor(
            name="Pinecone",
            type="vector_db",
            category="supporting_infra",
            risk_level="low",
            status="vetted",
            website="https://pinecone.io",
        ),
        Vendor(
            name="Cloudflare",
            type="infra",
            category="edge_infra",
            risk_level="low",
            status="vetted",
            website="https://cloudflare.com",
        ),
        Vendor(
            name="Custom Logic Hub",
            type="software",
            category="third_party",
            risk_level="high",
            status="pending",
            website="https://example-logic.com",
        ),
    ]

    with Session(engine) as session:
        # Clear existing items if any
        # session.query(ComplianceChecklistItem).delete() 
        
        for item in items:
            session.add(item)
            
        for vendor in vendors:
            session.add(vendor)
            
        session.commit()
        print(f"Seeded {len(items)} items and {len(vendors)} vendors.")

if __name__ == "__main__":
    seed_compliance()
