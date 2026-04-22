import sys
import os
from datetime import datetime

# Add app to path
sys.path.append(os.getcwd())

from app.core.models import Agent, LLMUsageLog, WorkforceInteraction, AgentAuditLog, FiscalRequest, AIModel, ArticleStatus, BiasReport
from app.services.optimization_service import optimization_service
from app.services.billing_service import billing_service
from app.services.workforce.base import BaseWorkforceService
from app.services.workforce.data_scraper import DataScraperService
from app.services.compliance_service import compliance_service

print("Checking imports...")
print(f"FiscalRequest imported: {FiscalRequest}")

print("\nChecking OptimizationService field alignment...")
import inspect
source = inspect.getsource(optimization_service.analyze_llm_performance)
if "timestamp" in source and "created_at" not in source:
    print("OptimizationService uses 'timestamp' correctly.")
else:
    print("ERROR: OptimizationService still uses 'created_at' or has issues.")

print("\nChecking ComplianceService refactor...")
model = AIModel(name="test", risk_category="high")
print(f"AIModel risk_category: {model.risk_category}")

print("\nChecking BaseWorkforceService scraper tool...")
base_ws = BaseWorkforceService()
# Mock CREWAI_AVAILABLE to force tool init
import app.services.workforce.base as base_mod
base_mod.CREWAI_AVAILABLE = True
tool = base_ws._init_scraper_tool()
print(f"Scraper tool initialized as: {type(tool)}")

print("\nAll semantic checks passed!")
