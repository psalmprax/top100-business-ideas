import sys
import os
from datetime import datetime
from sqlmodel import Session, select

# Adjust path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/python')))

from app.core.database import engine
from app.core.models import Agent, AgentStatus, AgentType, AgentAuditLog, SovereignRequest, AlertConfig, SQLModel
from app.services.agent_ops_service import agent_ops_service
from app.services.compliance_service import compliance_service

def verify_integration():
    print("🚀 Initializing test database schema...")
    SQLModel.metadata.create_all(engine)
    print("🚀 Starting Agent Ops & Governance Integration Verification...")
    
    with Session(engine) as session:
        # 1. Setup Test Data
        test_agent = Agent(
            name="Integration Test Bot",
            type=AgentType.automation,
            budget=100.0,
            dailySpend=150.0, # Trigger budget circuit breaker
            status=AgentStatus.RUNNING
        )
        session.add(test_agent)
        
        # Ensure at least one AlertConfig exists for remediation test
        if not session.exec(select(AlertConfig)).first():
            config = AlertConfig(
                name="Default Guardrail",
                alert_type="budget",
                threshold=0.9,
                action="pause",
                channels=["email"]
            )
            session.add(config)
            
        session.commit()
        session.refresh(test_agent)
        
        # 2. Test Budget Circuit Breaker (MagiC style)
        print("\n--- Testing Budget Circuit Breaker ---")
        result = agent_ops_service.check_budget_guardrail(test_agent.id)
        print(f"Result: {result}")
        
        session.refresh(test_agent)
        if test_agent.status == AgentStatus.PAUSED:
            print("✅ SUCCESS: Agent paused autonomously due to budget exhaustion.")
        else:
            print("❌ FAILURE: Agent status remains RUNNING despite budget breach.")

        # 3. Test Governance Guardrail (Guardrails AI style)
        print("\n--- Testing Governance Guardrail (High Risk) ---")
        gov_result = agent_ops_service.validate_agent_action(
            test_agent.id, 
            "Execute Unauthorized Transfer", 
            0.95, # High risk score
            "Scenario: Critical vulnerability exploit attempt detected."
        )
        print(f"Result: {gov_result}")
        if gov_result.get("status") == "governance_review_required":
            print("✅ SUCCESS: High-risk action triggered Sovereign Matrix review.")
        else:
            print("❌ FAILURE: Governance check did not trigger a review.")

        # 4. Test Article 61 Monitoring (EU AI Act style)
        print("\n--- Testing Article 61 Compliance Monitoring ---")
        comp_result = compliance_service.monitor_article_61_compliance(session, "test-model-001")
        print(f"Result: {comp_result}")
        if comp_result.get("status") == "remediation_triggered":
            print("✅ SUCCESS: Post-Market Monitoring triggered automated remediation.")
        else:
            print("❌ FAILURE: PMM did not detect high-risk logs.")

        # 5. Cleanup
        session.delete(test_agent)
        session.commit()
        print("\n✅ Verification Complete.")

if __name__ == "__main__":
    verify_integration()
