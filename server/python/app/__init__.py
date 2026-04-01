import sys
import logging
from unittest.mock import MagicMock

logger = logging.getLogger(__name__)

# Fallback mocking of heavy/missing ML dependencies to allow the server to boot.
# ML features will be non-functional when these mocks are active.
for mod in ["numpy", "torch", "transformers", "cv2", "PIL", "sklearn"]:
    if mod not in sys.modules:
        try:
            __import__(mod)
        except ImportError:
            sys.modules[mod] = MagicMock()
            logger.warning(
                f"ML dependency '{mod}' not found. Using mock. Install with: pip install {mod}"
            )
