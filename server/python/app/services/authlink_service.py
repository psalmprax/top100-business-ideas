"""Biometric AuthLink Service (FIDO2 Simulator)"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlmodel import Session, select
from app.core.models import HardwareChallenge, BiometricSignature, AuthenticationStatus

logger = logging.getLogger(__name__)

class AuthLinkService:
    """
    Simulates hardware-backed biometric authentication (FIDO2/WebAuthn).
    In production, this would use py_webauthn or a similar library.
    """
    
    def create_challenge(self, user_id: str, session: Session) -> HardwareChallenge:
        """Create a new hardware challenge for a user"""
        challenge = HardwareChallenge(
            user_id=user_id,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        session.add(challenge)
        session.commit()
        session.refresh(challenge)
        logger.info(f"Created hardware challenge {challenge.id} for user {user_id}")
        return challenge

    def verify_signature(
        self, 
        challenge_id: str, 
        signature: str, 
        hardware_id: str, 
        session: Session
    ) -> BiometricSignature:
        """Verify a cryptographically signed biometric proof"""
        challenge = session.get(HardwareChallenge, challenge_id)
        
        if not challenge:
            raise ValueError("Challenge not found")
            
        if challenge.expires_at < datetime.utcnow():
            challenge.status = AuthenticationStatus.EXPIRED
            session.add(challenge)
            session.commit()
            raise ValueError("Challenge expired")

        # Simulate cryptographic verification
        # In production: verify(signature, challenge, public_key)
        # For our simulator, a valid signature must start with "SIG_" and be of sufficient length
        is_valid = signature.startswith("SIG_") and len(signature) > 20
        
        sig_entry = BiometricSignature(
            challenge_id=challenge_id,
            signature=signature,
            hardware_id=hardware_id,
            verified=is_valid
        )
        
        challenge.status = AuthenticationStatus.VERIFIED if is_valid else AuthenticationStatus.FAILED
        
        session.add(sig_entry)
        session.add(challenge)
        session.commit()
        session.refresh(sig_entry)
        
        if is_valid:
            logger.info(f"Hardware challenge {challenge_id} verified via {hardware_id}")
        else:
            logger.warning(f"Hardware challenge {challenge_id} FAILED verification")
            
        return sig_entry

authlink_service = AuthLinkService()
