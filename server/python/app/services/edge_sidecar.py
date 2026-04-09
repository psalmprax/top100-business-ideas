"""
Edge Device Management Service
Manages edge device registrations and audit logs with database persistence.
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models.service_models import (
    EdgeDevice,
    EdgeDeviceStatus,
    EdgeDeviceType,
    EdgeAuditLog,
)

logger = logging.getLogger(__name__)


class EdgeSidecarService:
    """Manages edge devices with database persistence."""

    def list_devices(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all devices, optionally filtered by status."""
        with Session(engine) as session:
            query = select(EdgeDevice)

            if status:
                query = query.where(EdgeDevice.status == status)

            devices = session.exec(query).all()
            return [self._device_to_dict(d) for d in devices]

    def get_device(self, device_id: str) -> Optional[Dict[str, Any]]:
        """Get a device by ID."""
        with Session(engine) as session:
            device = session.exec(
                select(EdgeDevice).where(EdgeDevice.device_id == device_id)
            ).first()

            if device:
                return self._device_to_dict(device)
            return None

    def register_device(
        self,
        device_id: str,
        location: str,
        device_type: str = "industrial_controller",
        firmware_version: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Register a new edge device."""
        with Session(engine) as session:
            # Check if device already exists
            existing = session.exec(
                select(EdgeDevice).where(EdgeDevice.device_id == device_id)
            ).first()

            if existing:
                return {"error": f"Device {device_id} already exists"}

            device = EdgeDevice(
                device_id=device_id,
                location=location,
                device_type=device_type,
                status=EdgeDeviceStatus.ACTIVE,
                firmware_version=firmware_version,
            )
            session.add(device)
            session.commit()
            session.refresh(device)

            logger.info(f"Registered edge device: {device_id}")
            return self._device_to_dict(device)

    def unregister_device(self, device_id: str) -> bool:
        """Unregister (delete) a device."""
        with Session(engine) as session:
            device = session.exec(
                select(EdgeDevice).where(EdgeDevice.device_id == device_id)
            ).first()

            if device:
                session.delete(device)
                session.commit()
                logger.info(f"Unregistered edge device: {device_id}")
                return True

            return False

    def update_device_status(
        self,
        device_id: str,
        status: str,
    ) -> Optional[Dict[str, Any]]:
        """Update device status."""
        with Session(engine) as session:
            device = session.exec(
                select(EdgeDevice).where(EdgeDevice.device_id == device_id)
            ).first()

            if device:
                device.status = status
                if status == EdgeDeviceStatus.ACTIVE:
                    device.last_seen = datetime.utcnow()
                session.commit()
                return self._device_to_dict(device)

            return None

    def update_device(
        self,
        device_id: str,
        updates: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update device details."""
        with Session(engine) as session:
            device = session.exec(
                select(EdgeDevice).where(EdgeDevice.device_id == device_id)
            ).first()

            if not device:
                return {"error": "Device not found"}

            if "location" in updates:
                device.location = updates["location"]
            if "device_type" in updates:
                device.device_type = updates["device_type"]
            if "firmware_version" in updates:
                device.firmware_version = updates["firmware_version"]
            if "status" in updates:
                device.status = updates["status"]

            session.commit()
            session.refresh(device)

            return self._device_to_dict(device)

    def heartbeat(self, device_id: str) -> Optional[Dict[str, Any]]:
        """Record device heartbeat/last_seen."""
        return self.update_device_status(device_id, EdgeDeviceStatus.ACTIVE)

    def log_event(
        self,
        device_id: str,
        log_type: str,
        event_data: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Log an event for a device."""
        with Session(engine) as session:
            # Verify device exists
            device = session.exec(
                select(EdgeDevice).where(EdgeDevice.device_id == device_id)
            ).first()

            if not device:
                return {"error": "Device not found"}

            audit_log = EdgeAuditLog(
                device_id=device_id,
                log_type=log_type,
                event_data=event_data,
            )
            session.add(audit_log)
            session.commit()

            # Update device last_seen
            device.last_seen = datetime.utcnow()
            session.commit()

            return {
                "device_id": device_id,
                "log_type": log_type,
                "timestamp": audit_log.timestamp.isoformat(),
            }

    def get_device_logs(
        self,
        device_id: str,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Get audit logs for a device."""
        with Session(engine) as session:
            logs = session.exec(
                select(EdgeAuditLog)
                .where(EdgeAuditLog.device_id == device_id)
                .order_by(EdgeAuditLog.timestamp.desc())
                .limit(limit)
            ).all()

            return [
                {
                    "device_id": log.device_id,
                    "log_type": log.log_type,
                    "event_data": log.event_data,
                    "timestamp": log.timestamp.isoformat(),
                }
                for log in logs
            ]

    def get_device_stats(self) -> Dict[str, Any]:
        """Get aggregated device statistics."""
        with Session(engine) as session:
            all_devices = session.exec(select(EdgeDevice)).all()

            return {
                "total_devices": len(all_devices),
                "by_status": {
                    "active": len(
                        [d for d in all_devices if d.status == EdgeDeviceStatus.ACTIVE]
                    ),
                    "inactive": len(
                        [
                            d
                            for d in all_devices
                            if d.status == EdgeDeviceStatus.INACTIVE
                        ]
                    ),
                    "maintenance": len(
                        [
                            d
                            for d in all_devices
                            if d.status == EdgeDeviceStatus.MAINTENANCE
                        ]
                    ),
                    "error": len(
                        [d for d in all_devices if d.status == EdgeDeviceStatus.ERROR]
                    ),
                },
                "by_type": {
                    "plc_controller": len(
                        [
                            d
                            for d in all_devices
                            if d.device_type == EdgeDeviceType.PLC_CONTROLLER
                        ]
                    ),
                    "vision_system": len(
                        [
                            d
                            for d in all_devices
                            if d.device_type == EdgeDeviceType.VISION_SYSTEM
                        ]
                    ),
                    "robot_controller": len(
                        [
                            d
                            for d in all_devices
                            if d.device_type == EdgeDeviceType.ROBOT_CONTROLLER
                        ]
                    ),
                    "industrial_controller": len(
                        [
                            d
                            for d in all_devices
                            if d.device_type == EdgeDeviceType.INDUSTRIAL_CONTROLLER
                        ]
                    ),
                    "gateway": len(
                        [
                            d
                            for d in all_devices
                            if d.device_type == EdgeDeviceType.GATEWAY
                        ]
                    ),
                    "sensor": len(
                        [
                            d
                            for d in all_devices
                            if d.device_type == EdgeDeviceType.SENSOR
                        ]
                    ),
                },
            }

    def _device_to_dict(self, device: EdgeDevice) -> Dict[str, Any]:
        return {
            "device_id": device.device_id,
            "location": device.location,
            "device_type": device.device_type,
            "status": device.status,
            "firmware_version": device.firmware_version,
            "last_seen": device.last_seen.isoformat() if device.last_seen else None,
            "metadata": device.metadata_json,
            "created_at": device.created_at.isoformat() if device.created_at else None,
        }


# Singleton instances
edge_sidecar_service = EdgeSidecarService()
edge_compliance_sidecar = edge_sidecar_service  # Alias for backward compatibility
