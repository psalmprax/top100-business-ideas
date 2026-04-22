"""
Billing and Dynamic Budget Enforcement Service
Actively monitors token usage across all agents and automatically pauses operations if budget limits are exceeded.
"""

import stripe
import os
import logging
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import Agent, AlertConfig, Subscription, Invoice, User, AgentVigilanceAlert, AgentAuditLog, FiscalRequest

logger = logging.getLogger(__name__)

# Initialize Stripe with Secret Key from environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

class BillingService:
    def __init__(self):
        self._monitor_task = None
        self.is_running = False

    def start_budget_enforcement_loop(self):
        """Start the background enforcement loop"""
        if not self.is_running:
            self.is_running = True
            self._monitor_task = asyncio.create_task(self._monitor_loop())
            logger.info("Dynamic Budget Enforcement Service Started.")

    def stop_budget_enforcement_loop(self):
        self.is_running = False
        if self._monitor_task:
            self._monitor_task.cancel()

    async def _monitor_loop(self):
        """Continuously check agent spend against active budget rules."""
        while self.is_running:
            try:
                self.enforce_all_budgets()
            except Exception as e:
                logger.error(f"Error in budget enforcement loop: {e}")
            await asyncio.sleep(60) # Run every minute

    def enforce_all_budgets(self):
        """Check all agents against their budgets and active rules."""
        from app.core.models import AgentStatus
        with Session(engine) as session:
            agents = session.exec(select(Agent).where(Agent.status == AgentStatus.RUNNING)).all()
            rules = session.exec(select(AlertConfig).where(AlertConfig.is_active == True)).all()
            
            # Simple global budget rule parsing for demonstration
            global_budget_cap = None
            for rule in rules:
                if rule.alert_type == "budget_cap":
                    global_budget_cap = rule.threshold
            
            for agent in agents:
                effective_limit = agent.budget
                if global_budget_cap and global_budget_cap < agent.budget:
                    effective_limit = global_budget_cap
                
                if agent.daily_spend >= effective_limit:
                    logger.warning(f"Agent {agent.id} ({agent.name}) exceeded budget cap of {effective_limit}. Pausing agent...")
                    agent.status = AgentStatus.PAUSED
                    
                    # Create persistent alert
                    alert = AgentVigilanceAlert(
                        agent_id=agent.id,
                        type="budget_breach",
                        severity="high",
                        description=f"Agent breached budget cap of {effective_limit} with spend {agent.daily_spend}",
                        metadata_json={
                            "current_spend": agent.daily_spend,
                            "limit": effective_limit,
                            "is_global_cap": global_budget_cap == effective_limit
                        }
                    )
                    session.add(alert)
                    
                    # Create audit log
                    audit = AgentAuditLog(
                        agent_id=agent.id,
                        action="enforcement_pause",
                        intent="budget_protection",
                        outcome="agent_paused",
                        reasoning=f"Automated enforcement due to budget breach ({agent.daily_spend} >= {effective_limit})",
                        risk_score=0.8
                    )
                    session.add(audit)
            
            session.commit()

    def get_user_subscription(self, session: Session, user_id: str) -> Optional[Subscription]:
        """Fetch real-time subscription status from the database"""
        return session.exec(select(Subscription).where(Subscription.user_id == user_id)).first()

    def list_user_invoices(self, session: Session, user_id: str) -> List[Invoice]:
        """Fetch historical invoices for the user"""
        return session.exec(select(Invoice).where(Invoice.user_id == user_id).order_by(Invoice.date.desc())).all()

    async def create_checkout_session(self, user_id: str, price_id: str) -> Dict[str, Any]:
        """Create a real Stripe Checkout Session for a subscription"""
        try:
            with Session(engine) as session:
                user = session.get(User, user_id)
                if not user:
                    raise ValueError("User not found")
                
                # Create or retrieve Stripe customer
                if not user.stripe_customer_id:
                    customer = stripe.Customer.create(
                        email=user.email,
                        metadata={"user_id": user_id}
                    )
                    user.stripe_customer_id = customer.id
                    session.add(user)
                    
                    requests = [
                        {
                            "purpose": "WhatsApp Support",
                            "amount": "$5.00",
                        },
                    ]
                    for r in requests:
                        session.add(FiscalRequest(**r))
                    session.commit()
                
                checkout_session = stripe.checkout.Session.create(
                    customer=user.stripe_customer_id,
                    success_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/billing?success=true",
                    cancel_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/billing?canceled=true",
                    payment_method_types=["card"],
                    mode="subscription",
                    line_items=[{"price": price_id, "quantity": 1}],
                )
                return {"url": checkout_session.url, "id": checkout_session.id}
        except Exception as e:
            logger.error(f"Stripe Checkout Error: {e}")
            raise

    def handle_stripe_webhook(self, payload: bytes, sig_header: str):
        """Process incoming Stripe webhooks with signature verification"""
        event = None
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, stripe_webhook_secret
            )
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")

        # Handle specifically the checkout.session.completed event
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            self._fulfill_subscription(session)
        
        return {"status": "success"}

    def _fulfill_subscription(self, stripe_session: Any):
        """Update database with new subscription status from Stripe fulfillment"""
        customer_id = stripe_session.get("customer")
        subscription_id = stripe_session.get("subscription")
        
        with Session(engine) as session:
            user = session.exec(select(User).where(User.stripe_customer_id == customer_id)).first()
            if user:
                # Create or update subscription
                sub = session.exec(select(Subscription).where(Subscription.user_id == user.id)).first()
                if not sub:
                    sub = Subscription(user_id=user.id)
                
                sub.stripe_subscription_id = subscription_id
                sub.status = "active"
                sub.plan_id = stripe_session.get("line_items", [{}])[0].get("price", "starter") # Fallback to starter
                sub.current_period_end = datetime.fromtimestamp(stripe_session.get("expires_at", 0))
                
                session.add(sub)
                session.commit()
                logger.info(f"Subscription fulfilled for user {user.id}")

# Singleton
billing_service = BillingService()
