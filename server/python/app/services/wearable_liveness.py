"""
Wearable Liveness Service for Deepfake Defense
Integration for spatial computing sensors (Apple Vision Pro, Meta Quest).
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import uuid
import logging

logger = logging.getLogger(__name__)


class WearableDeviceType(str, Enum):
    APPLE_VISION_PRO = "apple_vision_pro"
    META_QUEST = "meta_quest"
    MICROSOFT_MESH = "microsoft_mesh"
    VARJO_XR = "varjo_xr"
    GENERIC_AR = "generic_ar"


class SpatialLivenessCheck(str, Enum):
    EYE_TRACKING = "eye_tracking"           # Verify authentic eye movement
    IRIS_RESPONSE = "iris_response"           # Pupil dilation response
    SPATIAL_JITTER = "spatial_jitter"         # Micro-movements of living eye
    ACCELEROMETER = "accelerometer"           # Device movement patterns
    DEPTH_MAP = "depth_map"                   # 3D depth analysis
    FACE_GEOMETRY = "face_geometry"           # Face shape consistency


class WearableSession:
    """Represents a wearable device verification session."""
    
    def __init__(
        self,
        session_id: str,
        device_type: WearableDeviceType,
        user_id: str,
    ):
        self.session_id = session_id
        self.device_type = device_type
        self.user_id = user_id
        self.created_at = datetime.utcnow()
        self.completed_at = None
        self.sensor_data = {}
        self.checks_performed = []
        self.result = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "device_type": self.device_type.value,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "checks_performed": self.checks_performed,
            "sensor_data": self.sensor_data,
            "result": self.result,
        }


class WearableLivenessService:
    """
    Service for verifying liveness using spatial computing wearable devices.
    Provides deepfake detection for VR/AR/MR environments.
    """
    
    def __init__(self):
        self.sessions: Dict[str, WearableSession] = {}
        self.device_profiles: Dict[WearableDeviceType, Dict[str, Any]] = {
            WearableDeviceType.APPLE_VISION_PRO: {
                "name": "Apple Vision Pro",
                "sensors": ["TrueDepth", "LiDAR", "Eye Tracking", "Hand Tracking"],
                "auth_method": "Optic ID",
                "supported_checks": [
                    SpatialLivenessCheck.EYE_TRACKING,
                    SpatialLivenessCheck.IRIS_RESPONSE,
                    SpatialLivenessCheck.SPATIAL_JITTER,
                    SpatialLivenessCheck.DEPTH_MAP,
                ],
            },
            WearableDeviceType.META_QUEST: {
                "name": "Meta Quest",
                "sensors": ["Inside-out Tracking", "Hand Tracking", "Mixed Reality"],
                "auth_method": "Passthrough Authentication",
                "supported_checks": [
                    SpatialLivenessCheck.EYE_TRACKING,
                    SpatialLivenessCheck.ACCELEROMETER,
                    SpatialLivenessCheck.FACE_GEOMETRY,
                ],
            },
            WearableDeviceType.MICROSOFT_MESH: {
                "name": "Microsoft Mesh",
                "sensors": ["HoloLens 2 Sensors", "Eye Tracking"],
                "auth_method": "Azure AD Authentication",
                "supported_checks": [
                    SpatialLivenessCheck.EYE_TRACKING,
                    SpatialLivenessCheck.DEPTH_MAP,
                ],
            },
            WearableDeviceType.VARJO_XR: {
                "name": "Varjo XR",
                "sensors": ["Eye Tracking", "LiDAR", "Ultrasonic"],
                "auth_method": "Biometric Authentication",
                "supported_checks": [
                    SpatialLivenessCheck.EYE_TRACKING,
                    SpatialLivenessCheck.IRIS_RESPONSE,
                    SpatialLivenessCheck.SPATIAL_JITTER,
                    SpatialLivenessCheck.DEPTH_MAP,
                ],
            },
        }
    
    def create_session(
        self,
        device_type: WearableDeviceType,
        user_id: str,
    ) -> WearableSession:
        """Create a new wearable verification session."""
        
        session_id = str(uuid.uuid4())
        session = WearableSession(session_id, device_type, user_id)
        
        # Store device capabilities
        device_profile = self.device_profiles.get(device_type, {})
        session.device_capabilities = device_profile.get("supported_checks", [])
        
        self.sessions[session_id] = session
        
        logger.info(f"Created wearable session: {session_id} for {device_type.value}")
        
        return session
    
    def receive_sensor_data(
        self,
        session_id: str,
        sensor_type: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Receive sensor data from the wearable device."""
        
        session = self.sessions.get(session_id)
        if not session:
            return {"error": "Session not found", "status": "failed"}
        
        # Store sensor data
        session.sensor_data[sensor_type] = {
            "received_at": datetime.utcnow().isoformat(),
            "data": data,
        }
        
        # Process specific sensor data
        result = {"sensor_type": sensor_type, "processed": True}
        
        if sensor_type == "eye_tracking":
            result["analysis"] = self._analyze_eye_tracking(data)
        elif sensor_type == "depth_map":
            result["analysis"] = self._analyze_depth_map(data)
        elif sensor_type == "iris":
            result["analysis"] = self._analyze_iris_response(data)
        elif sensor_type == "accelerometer":
            result["analysis"] = self._analyze_accelerometer(data)
        
        session.checks_performed.append({
            "check": sensor_type,
            "timestamp": datetime.utcnow().isoformat(),
            "result": result.get("analysis", {}),
        })
        
        return result
    
    def _analyze_eye_tracking(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze eye tracking data for liveness.
        Real eyes have micro-saccades and smooth pursuit movements.
        """
        
        # Extract gaze points
        gaze_points = data.get("gaze_points", [])
        
        if not gaze_points:
            return {"verified": False, "confidence": 0, "reason": "No gaze data"}
        
        # Analyze movement patterns
        # Real eyes have micro-movements (microsaccades)
        # Deepfakes typically have smooth but unnatural gaze
        
        # Calculate metrics
        movement_variance = data.get("movement_variance", 0.5)
        fixation_duration = data.get("fixation_duration_ms", 200)
        
        # Heuristics for live detection
        is_live = (
            movement_variance > 0.1 and  # Has micro-movements
            fixation_duration < 500      # Natural fixation limits
        )
        
        return {
            "verified": is_live,
            "confidence": 0.92 if is_live else 0.3,
            "metrics": {
                "movement_variance": movement_variance,
                "fixation_duration_ms": fixation_duration,
            },
            "checks": {
                "microsaccades_present": movement_variance > 0.1,
                "natural_fixation": fixation_duration < 500,
            }
        }
    
    def _analyze_depth_map(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze depth map for 3D consistency."""
        
        depth_values = data.get("depth_values", [])
        
        if not depth_values:
            return {"verified": False, "confidence": 0, "reason": "No depth data"}
        
        # Check for 3D consistency
        # A real face has consistent depth across features
        # A flat image/video would show uniform depth
        
        depth_variance = data.get("depth_variance", 0.5)
        nose_depth = data.get("nose_tip_depth", 0)
        eye_depth = data.get("eye_plane_depth", 0)
        
        # Real face: nose sticks out, eyes are recessed
        proper_nose_projection = nose_depth > eye_depth + 0.02
        
        is_live = depth_variance > 0.2 and proper_nose_projection
        
        return {
            "verified": is_live,
            "confidence": 0.95 if is_live else 0.2,
            "metrics": {
                "depth_variance": depth_variance,
                "nose_projection": nose_depth - eye_depth,
            },
            "checks": {
                "3d_consistency": depth_variance > 0.2,
                "proper_nose_projection": proper_nose_projection,
            }
        }
    
    def _analyze_iris_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze iris/pupil response for liveness."""
        
        pupil_dilation = data.get("pupil_dilation_mm", 3.0)
        ambient_light = data.get("ambient_light_lux", 500)
        
        # Pupils should react to light changes
        # In bright light, pupils constrict (smaller)
        # In dark, pupils dilate (larger)
        
        expected_pupil = 3.0 + (1000 - min(ambient_light, 1000)) / 1000 * 2
        pupil_reacts_to_light = abs(pupil_dilation - expected_pupil) < 1.0
        
        return {
            "verified": pupil_reacts_to_light,
            "confidence": 0.88 if pupil_reacts_to_light else 0.15,
            "metrics": {
                "pupil_dilation_mm": pupil_dilation,
                "ambient_light_lux": ambient_light,
                "expected_pupil_mm": expected_pupil,
            },
            "checks": {
                "pupil_reacts_to_light": pupil_reacts_to_light,
            }
        }
    
    def _analyze_accelerometer(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze accelerometer for natural head movement patterns."""
        
        acceleration = data.get("acceleration", [0, 0, 0])
        
        # Calculate movement intensity
        intensity = (acceleration[0]**2 + acceleration[1]**2 + acceleration[2]**2) ** 0.5
        
        # Natural head movements have specific patterns
        # Not random (bots) or perfectly still (photo)
        is_live = 0.5 < intensity < 15.0  # G-force range
        
        return {
            "verified": is_live,
            "confidence": 0.85 if is_live else 0.25,
            "metrics": {
                "intensity_g": intensity,
            },
            "checks": {
                "natural_movement": is_live,
            }
        }
    
    def complete_session(self, session_id: str) -> Dict[str, Any]:
        """Complete the wearable verification session."""
        
        session = self.sessions.get(session_id)
        if not session:
            return {"error": "Session not found"}
        
        # Calculate overall result
        if not session.checks_performed:
            session.result = {
                "success": False,
                "confidence": 0,
                "reason": "No checks performed",
            }
        else:
            # Aggregate check results
            verified_checks = sum(
                1 for c in session.checks_performed 
                if c.get("result", {}).get("verified", False)
            )
            total_checks = len(session.checks_performed)
            
            confidence_scores = [
                c.get("result", {}).get("confidence", 0)
                for c in session.checks_performed
            ]
            avg_confidence = sum(confidence_scores) / len(confidence_scores)
            
            success = verified_checks >= total_checks * 0.7  # 70% threshold
            
            session.result = {
                "success": success,
                "confidence": avg_confidence,
                "checks_passed": verified_checks,
                "checks_total": total_checks,
                "device_type": session.device_type.value,
            }
        
        session.completed_at = datetime.utcnow()
        
        # Clean up
        result = session.result
        del self.sessions[session_id]
        
        return result
    
    def get_device_capabilities(
        self, device_type: WearableDeviceType
    ) -> Optional[Dict[str, Any]]:
        """Get capabilities for a specific device type."""
        return self.device_profiles.get(device_type)
    
    def get_session_status(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of a wearable session."""
        session = self.sessions.get(session_id)
        if session:
            return session.to_dict()
        return None


# Singleton instance
wearable_liveness_service = WearableLivenessService()
