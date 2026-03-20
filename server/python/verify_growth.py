import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.growth_service import growth_service

async def verify_growth_service():
    print("--- Verifying GrowthService ---")
    
    # Test 1: Initialization
    print(f"Service initialized: {growth_service is not None}")
    
    # Test 2: Mock Campaign (No API Key)
    print("\nRunning Mock Campaign...")
    result = await growth_service.run_marketing_campaign(
        topic="AI Compliance for SMBs", 
        target_audience="Small Business Owners"
    )
    print(f"Mock Result: {result['status']}")
    print(f"Content Preview: {result.get('content', 'No content')[:50]}...")
    
    # Test 3: Lead Sourcing (Simple search)
    print("\nSourcing Leads...")
    leads = await growth_service.source_leads(criteria="FinTech startups in Europe")
    print(f"Leads Found: {len(leads)}")
    if leads and 'findings' in leads[0]:
        print(f"First Lead findings: {leads[0]['findings'][:100]}...")
    elif leads:
        print(f"First Lead result: {leads[0]}")

if __name__ == "__main__":
    asyncio.run(verify_growth_service())
