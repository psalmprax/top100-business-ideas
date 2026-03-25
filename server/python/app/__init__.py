import sys
from unittest.mock import MagicMock

# Global Mocking of heavy/missing ML dependencies to unblock functional verification
# This allows the Sentinel dashboard to load even if ML packages are installing
for mod in ["numpy", "torch", "transformers", "cv2", "PIL", "sklearn"]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()
