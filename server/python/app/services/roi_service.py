"""
ROI Calculation Service for Agent Ops
Handles Downtime-to-Dollar and Productivity ROI logic.
"""

from typing import Dict, Any
from app.core.models import Agent, AgentType, AgentStatus

class ROIService:
    @staticmethod
    def calculate_downtime_loss(agent: Agent) -> float:
        """
        Calculates theoretical dollar loss due to agent downtime.
        Based on agent type hourly revenue generation / labor savings.
        """
        # If agent is running, there is no current downtime loss
        if agent.status == AgentStatus.RUNNING:
            return 0.0
            
        # Hourly value based on agent type (Market standards)
        value_map = {
            AgentType.DATA_PROCESSING: 45.0,  # $45/hr savings
            AgentType.CONTENT_GENERATION: 85.0, # $85/hr savings
            AgentType.ANALYSIS: 150.0,         # $150/hr savings
            AgentType.AUTOMATION: 65.0,         # $65/hr savings
        }
        
        hourly_rate = value_map.get(agent.type, 50.0)
        
        # Simulating downtime duration (in real world, diff between updated_at and now)
        # For 'error' status, we assume 4.5 hours of disruption
        downtime_hours = 4.5 if agent.status == AgentStatus.ERROR else 0.5
        
        return round(hourly_rate * downtime_hours, 2)

    @staticmethod
    def calculate_productivity_roi(agent: Agent) -> Dict[str, Any]:
        """
        Calculates risk-adjusted productivity ROI based on agent metrics.
        """
        # Define baseline costs
        avg_token_cost_per_request = 0.008
        manual_labor_cost_per_task = 22.50 # Human cost baseline
        
        total_requests = agent.metrics.get("totalRequests", 0)
        total_cost = agent.metrics.get("totalCost", total_requests * avg_token_cost_per_request)
        
        # Calculate saved costs
        human_equivalent_cost = total_requests * manual_labor_cost_per_task
        net_savings = human_equivalent_cost - total_cost
        
        # Calculate loops prevented value
        loops_prevented = agent.metrics.get("loopsPrevented", 0)
        loop_mitigation_value = loops_prevented * 150.0 # High value for preventing runaway costs
        
        total_economic_value = net_savings + loop_mitigation_value
        roi_multiple = total_economic_value / (total_cost if total_cost > 0 else 1)
        
        return {
            "total_cost": round(total_cost, 2),
            "net_savings": round(net_savings, 2),
            "loop_mitigation_value": round(loop_mitigation_value, 2),
            "total_economic_value": round(total_economic_value, 2),
            "roi_multiple": round(roi_multiple, 1),
            "status": "elite" if roi_multiple > 10 else "optimized"
        }

roi_service = ROIService()
