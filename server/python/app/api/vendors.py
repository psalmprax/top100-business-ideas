from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.connectors.supply_chain_audit import supply_chain_audit, VendorRiskLevel

router = APIRouter()

class VendorCreate(BaseModel):
    vendorId: str
    name: str
    tier: int
    serviceType: str
    website: Optional[str] = None

class VendorResponse(BaseModel):
    id: str
    name: str
    tier: int
    type: str
    website: Optional[str] = None
    complianceStatus: str
    riskLevel: str
    lastAssessment: Optional[str] = None
    documents: Dict[str, Any]
    issues: List[str]

@router.get("", response_model=List[VendorResponse])
async def list_vendors():
    """List all vendors in the supply chain."""
    vendors = []
    for v in supply_chain_audit.vendors.values():
        d = v.to_dict()
        # Map snake_case to camelCase for frontend
        vendors.append({
            "id": d["vendor_id"],
            "name": d["name"],
            "tier": d["tier"],
            "type": d["service_type"],
            "website": d["website"],
            "complianceStatus": d["compliance_status"],
            "riskLevel": d["risk_level"],
            "lastAssessment": d["last_audit"],
            "documents": d["documents"],
            "issues": d["issues"]
        })
    return vendors

@router.post("", status_code=201)
async def add_vendor(vendor: VendorCreate):
    """Add a new vendor to the supply chain."""
    success = supply_chain_audit.add_vendor(
        vendor.vendorId,
        vendor.name,
        vendor.tier,
        vendor.serviceType,
        vendor.website
    )
    if not success:
        raise HTTPException(status_code=400, detail="Vendor ID already exists")
    return {"message": "Vendor added successfully"}

@router.delete("/{vendor_id}")
async def delete_vendor(vendor_id: str):
    """Remove a vendor from the supply chain."""
    success = supply_chain_audit.remove_vendor(vendor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor removed successfully"}

@router.post("/{vendor_id}/audit")
async def trigger_audit(vendor_id: str, background_tasks: BackgroundTasks):
    """Trigger a compliance audit for a specific vendor."""
    if vendor_id not in supply_chain_audit.vendors:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Run audit in background or return immediately if it's fast
    # For now, we'll run it and return the result as it's just HTTP checks
    result = await supply_chain_audit.audit_vendor(vendor_id)
    return result

@router.post("/audit-all")
async def audit_all(background_tasks: BackgroundTasks):
    """Trigger audits for all vendors."""
    # This might take time, so it's a candidate for background tasks
    # But for demo/UX we might want to return a summary
    results = await supply_chain_audit.audit_all_vendors()
    return results

@router.get("/report")
async def get_risk_report():
    """Get the comprehensive supply chain risk report."""
    return supply_chain_audit.get_supply_chain_risk_report()

@router.get("/stats")
async def get_vendor_stats():
    """Get high-level supply chain statistics."""
    vendors = list(supply_chain_audit.vendors.values())
    return {
        "total_vendors": len(vendors),
        "tiers": {
            1: len([v for v in vendors if v.tier == 1]),
            2: len([v for v in vendors if v.tier == 2]),
            3: len([v for v in vendors if v.tier == 3]),
        },
        "risk_breakdown": {
            "low": len([v for v in vendors if v.risk_level == VendorRiskLevel.LOW]),
            "medium": len([v for v in vendors if v.risk_level == VendorRiskLevel.MEDIUM]),
            "high": len([v for v in vendors if v.risk_level == VendorRiskLevel.HIGH]),
            "critical": len([v for v in vendors if v.risk_level == VendorRiskLevel.CRITICAL]),
        }
    }
