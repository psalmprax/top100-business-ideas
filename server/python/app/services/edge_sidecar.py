"""
Edge AI Sidecar for ReguLens
On-device compliance auditing for industrial AI without constant internet.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import uuid
import logging
import json
import hashlib

logger = logging.getLogger(__name__)


class EdgeStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    SYNCING = "syncing"
    ERROR = "error"


class LogType(str, Enum):
    SAFETY = "safety"
    PERFORMANCE = "performance"
    COMPLIANCE = "compliance"
    SECURITY = "security"


class EdgeAuditLog:
    """Represents an audit log entry on the edge device."""
    
    def __init__(
        self,
        log_id: str,
        log_type: LogType,
        event_data: Dict[str, Any],
        timestamp: Optional[datetime] = None,
    ):
        self.log_id = log_id
        self.log_type = log_type
        self.event_data = event_data
        self.timestamp = timestamp or datetime.utcnow()
        self.synced = False
        self.hash = self._compute_hash()
    
    def _compute_hash(self) -> str:
        """Compute SHA-256 hash for tamper detection."""
        content = f"{self.log_id}{self.log_type.value}{json.dumps(self.event_data)}{self.timestamp.isoformat()}"
        return hashlib.sha256(content.encode()).hexdigest()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "log_id": self.log_id,
            "log_type": self.log_type.value,
            "event_data": self.event_data,
            "timestamp": self.timestamp.isoformat(),
            "synced": self.synced,
            "hash": self.hash,
        }


class EdgeDevice:
    """Represents an edge device running the compliance sidecar."""
    
    def __init__(
        self,
        device_id: str,
        location: str,
        device_type: str = "industrial_controller",
    ):
        self.device_id = device_id
        self.location = location
        self.device_type = device_type
        self.status = EdgeStatus.OFFLINE
        self.last_sync = None
        self.logs: List[EdgeAuditLog] = []
        self.compliance_rules = []
        self.created_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "device_id": self.device_id,
            "location": self.location,
            "device_type": self.device_type,
            "status": self.status.value,
            "last_sync": self.last_sync.isoformat() if self.last_sync else None,
            "logs_pending": len([l for l in self.logs if not l.synced]),
            "compliance_rules": self.compliance_rules,
            "created_at": self.created_at.isoformat(),
        }


class EdgeComplianceSidecar:
    """
    Edge AI compliance sidecar for on-premise industrial AI systems.
    Performs local auditing and batch-syncs when connection is available.
    """
    
    def __init__(self):
        self.devices: Dict[str, EdgeDevice] = {}
        self.pending_syncs: List[Dict[str, Any]] = []
        
        # Initialize demo devices
        self._init_demo_devices()
    
    def _init_demo_devices(self):
        """Initialize demo edge devices."""
        demo_devices = [
            EdgeDevice("edge-001", "Factory Floor A - Assembly Line 1", "plc_controller"),
            EdgeDevice("edge-002", "Factory Floor B - Quality Control", "vision_system"),
            EdgeDevice("edge-003", "Warehouse - Robotic Arm Controller", "robot_controller"),
        ]
        
        for device in demo_devices:
            self.devices[device.device_id] = device
    
    def register_device(
        self,
        device_id: str,
        location: str,
        device_type: str = "industrial_controller",
    ) -> EdgeDevice:
        """Register a new edge device."""
        
        device = EdgeDevice(device_id, location, device_type)
        self.devices[device_id] = device
        
        logger.info(f"Registered edge device: {device_id}")
        
        return device
    
    def unregister_device(self, device_id: str) -> bool:
        """Unregister an edge device."""
        
        if device_id in self.devices:
            del self.devices[device_id]
            logger.info(f"Unregistered edge device: {device_id}")
            return True
        
        return False
    
    def log_event(
        self,
        device_id: str,
        log_type: LogType,
        event_data: Dict[str, Any],
    ) -> Optional[EdgeAuditLog]:
        """
        Log a compliance event on the edge device.
        Works offline - stores locally for later sync.
        """
        
        device = self.devices.get(device_id)
        if not device:
            logger.error(f"Device {device_id} not found")
            return None
        
        # Create log entry
        log = EdgeAuditLog(
            log_id=str(uuid.uuid4()),
            log_type=log_type,
            event_data=event_data,
        )
        
        device.logs.append(log)
        
        logger.info(f"Logged {log_type.value} event on device {device_id}")
        
        # Try immediate sync if online
        if device.status == EdgeStatus.ONLINE:
            self._queue_sync(device)
        
        return log
    
    def check_compliance(
        self,
        device_id: str,
        metrics: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Run compliance checks on edge device metrics.
        Evaluates against configured rules and logs violations.
        """
        
        device = self.devices.get(device_id)
        if not device:
            return {"error": "Device not found"}
        
        violations = []
        warnings = []
        
        # Check safety metrics
        if "temperature" in metrics:
            if metrics["temperature"] > 85:
                violations.append({
                    "rule": "MAX_TEMPERATURE",
                    "severity": "critical",
                    "message": f"Temperature {metrics['temperature']}°C exceeds limit",
                })
                # Log safety event
                self.log_event(device_id, LogType.SAFETY, {
                    "event": "temperature_exceeded",
                    "value": metrics["temperature"],
                    "limit": 85,
                })
        
        if "response_time_ms" in metrics:
            if metrics["response_time_ms"] > 100:
                warnings.append({
                    "rule": "RESPONSE_TIME",
                    "severity": "warning",
                    "message": f"Response time {metrics['response_time_ms']}ms above target",
                })
        
        # Check performance metrics
        if "error_rate" in metrics:
            if metrics["error_rate"] > 0.05:  # 5%
                violations.append({
                    "rule": "ERROR_RATE",
                    "severity": "critical",
                    "message": f"Error rate {metrics['error_rate']*100}% exceeds limit",
                })
                self.log_event(device_id, LogType.PERFORMANCE, {
                    "event": "error_rate_exceeded",
                    "value": metrics["error_rate"],
                })
        
        # Check security metrics
        if "failed_auth" in metrics and metrics["failed_auth"] > 3:
            violations.append({
                "rule": "FAILED_AUTH",
                "severity": "high",
                "message": f"{metrics['failed_auth']} failed authentication attempts",
            })
            self.log_event(device_id, LogType.SECURITY, {
                "event": "authentication_failure",
                "count": metrics["failed_auth"],
            })
        
        status = "compliant"
        if violations:
            status = "non_compliant"
        elif warnings:
            status = "warning"
        
        return {
            "device_id": device_id,
            "status": status,
            "violations": violations,
            "warnings": warnings,
            "checked_at": datetime.utcnow().isoformat(),
        }
    
    def sync_device(self, device_id: str) -> Dict[str, Any]:
        """
        Manually trigger sync for a device.
        Returns sync status and queued logs.
        """
        
        device = self.devices.get(device_id)
        if not device:
            return {"error": "Device not found"}
        
        # Find unsynced logs
        unsynced = [log for log in device.logs if not log.synced]
        
        if not unsynced:
            return {
                "device_id": device_id,
                "synced": 0,
                "message": "No logs to sync",
            }
        
        # Simulate sync to cloud
        # In production, would POST to cloud endpoint
        
        sync_payload = {
            "device_id": device_id,
            "sync_id": str(uuid.uuid4()),
            "logs": [log.to_dict() for log in unsynced],
            "synced_at": datetime.utcnow().isoformat(),
        }
        
        # Mark as synced
        for log in unsynced:
            log.synced = True
        
        device.last_sync = datetime.utcnow()
        
        # Store for batch processing
        self.pending_syncs.append(sync_payload)
        
        logger.info(f"Synced {len(unsynced)} logs for device {device_id}")
        
        return {
            "device_id": device_id,
            "synced": len(unsynced),
            "sync_id": sync_payload["sync_id"],
            "synced_at": sync_payload["synced_at"],
        }
    
    def _queue_sync(self, device: EdgeDevice):
        """Queue a device for sync."""
        if device.status != EdgeStatus.ONLINE:
            device.status = EdgeStatus.SYNCING
    
    def set_device_online(self, device_id: str) -> Dict[str, Any]:
        """Set device as online and trigger sync."""
        
        device = self.devices.get(device_id)
        if not device:
            return {"error": "Device not found"}
        
        device.status = EdgeStatus.ONLINE
        
        # Auto-sync pending logs
        pending = [log for log in device.logs if not log.synced]
        
        if pending:
            return self.sync_device(device_id)
        
        return {
            "device_id": device_id,
            "status": "online",
            "message": "Device is online, no pending logs",
        }
    
    def set_device_offline(self, device_id: str) -> Dict[str, Any]:
        """Set device as offline."""
        
        device = self.devices.get(device_id)
        if not device:
            return {"error": "Device not found"}
        
        device.status = EdgeStatus.OFFLINE
        
        return {
            "device_id": device_id,
            "status": "offline",
            "pending_logs": len([l for l in device.logs if not l.synced]),
        }
    
    def get_device_status(self, device_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of an edge device."""
        
        device = self.devices.get(device_id)
        if device:
            return device.to_dict()
        return None
    
    def get_all_devices(self) -> List[Dict[str, Any]]:
        """Get status of all registered devices."""
        return [device.to_dict() for device in self.devices.values()]
    
    def get_pending_logs(self, device_id: str) -> List[Dict[str, Any]]:
        """Get pending (unsynced) logs for a device."""
        
        device = self.devices.get(device_id)
        if not device:
            return []
        
        return [
            log.to_dict() 
            for log in device.logs 
            if not log.synced
        ]
    
    def get_compliance_summary(self) -> Dict[str, Any]:
        """Get overall compliance summary across all devices."""
        
        total_devices = len(self.devices)
        online = sum(1 for d in self.devices.values() if d.status == EdgeStatus.ONLINE)
        offline = sum(1 for d in self.devices.values() if d.status == EdgeStatus.OFFLINE)
        
        total_logs = sum(len(d.logs) for d in self.devices.values())
        synced_logs = sum(len([l for l in d.logs if l.synced]) for d in self.devices.values())
        
        return {
            "total_devices": total_devices,
            "online": online,
            "offline": offline,
            "total_logs": total_logs,
            "synced_logs": synced_logs,
            "pending_logs": total_logs - synced_logs,
            "sync_percentage": (synced_logs / total_logs * 100) if total_logs > 0 else 100,
        }


# Singleton instance
edge_compliance_sidecar = EdgeComplianceSidecar()
