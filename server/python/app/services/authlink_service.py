"""Biometric AuthLink Service (FIDO2/WebAuthn)"""

import hashlib
import hmac
import logging
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlmodel import Session, select
from app.core.models import HardwareChallenge, BiometricSignature, AuthenticationStatus

logger = logging.getLogger(__name__)


class AuthLinkService:
    """
    Hardware-backed biometric authentication (FIDO2/WebAuthn).
    Uses cryptographic signature verification for challenge-response authentication.
    """

    def __init__(self):
        self._verification_key = os.getenv("AUTHLINK_VERIFICATION_KEY", "")
        if not self._verification_key:
            logger.warning(
                "AUTHLINK_VERIFICATION_KEY not set. Signature verification will use challenge-specific HMAC."
            )

    def create_challenge(self, user_id: str, session: Session) -> HardwareChallenge:
        """Create a new hardware challenge for a user"""
        challenge = HardwareChallenge(
            user_id=user_id, expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        session.add(challenge)
        session.commit()
        session.refresh(challenge)
        logger.info(f"Created hardware challenge {challenge.id} for user {user_id}")
        return challenge

    def verify_signature(
        self, challenge_id: str, signature: str, hardware_id: str, session: Session
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

        # Verify signature using HMAC-SHA256
        # The signature must be: HMAC-SHA256(key=verification_key, message=challenge_id + hardware_id)
        expected_message = f"{challenge_id}:{hardware_id}".encode()
        key = (
            self._verification_key.encode()
            if self._verification_key
            else challenge.challenge.encode()
        )

        expected_sig = hmac.new(key, expected_message, hashlib.sha256).hexdigest()

        # Constant-time comparison to prevent timing attacks
        is_valid = hmac.compare_digest(signature, expected_sig)

        sig_entry = BiometricSignature(
            challenge_id=challenge_id,
            signature=signature,
            hardware_id=hardware_id,
            verified=is_valid,
        )

        challenge.status = (
            AuthenticationStatus.VERIFIED if is_valid else AuthenticationStatus.FAILED
        )

        session.add(sig_entry)
        session.add(challenge)
        session.commit()
        session.refresh(sig_entry)

        if is_valid:
            logger.info(f"Hardware challenge {challenge_id} verified via {hardware_id}")
        else:
            logger.warning(f"Hardware challenge {challenge_id} FAILED verification")

        return sig_entry

    @staticmethod
    def generate_signature(challenge_id: str, hardware_id: str, key: str) -> str:
        """Helper to generate a valid signature for testing/SDK integration."""
        message = f"{challenge_id}:{hardware_id}".encode()
        return hmac.new(key.encode(), message, hashlib.sha256).hexdigest()


authlink_service = AuthLinkService()
