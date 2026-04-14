"""
DEPRECATED: Use app.services.workforce instead.
This file exists for backward compatibility only.
"""

import warnings
import logging

warnings.warn(
    "workforce_service.py is deprecated. Use app.services.workforce instead.",
    DeprecationWarning,
    stacklevel=2,
)

logger = logging.getLogger(__name__)

# Import from new modular implementation
from app.services.workforce import WorkforceService, workforce_service

__all__ = ["WorkforceService", "workforce_service"]
