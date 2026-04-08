"""
Lazy ML Loader - Dynamically imports heavy ML dependencies to speed up container builds
"""

import importlib
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class LazyMLLoader:
    """Lazy loader for heavy ML dependencies to improve container build times"""

    _torch: Optional[Any] = None
    _torchvision: Optional[Any] = None
    _transformers: Optional[Any] = None
    _librosa: Optional[Any] = None
    _cv2: Optional[Any] = None

    @classmethod
    def load_torch(cls) -> Any:
        """Lazy load PyTorch"""
        if cls._torch is None:
            try:
                cls._torch = importlib.import_module("torch")
                logger.info("PyTorch loaded successfully")
            except ImportError as e:
                logger.warning(f"PyTorch not available: {e}")
                raise ImportError(
                    "PyTorch not installed. Install with: pip install torch torchvision"
                )
        return cls._torch

    @classmethod
    def load_torchvision(cls) -> Any:
        """Lazy load torchvision"""
        if cls._torchvision is None:
            try:
                cls._torchvision = importlib.import_module("torchvision")
                logger.info("Torchvision loaded successfully")
            except ImportError as e:
                logger.warning(f"Torchvision not available: {e}")
                raise ImportError(
                    "Torchvision not installed. Install with: pip install torchvision"
                )
        return cls._torchvision

    @classmethod
    def load_transformers(cls) -> Any:
        """Lazy load transformers"""
        if cls._transformers is None:
            try:
                cls._transformers = importlib.import_module("transformers")
                logger.info("Transformers loaded successfully")
            except ImportError as e:
                logger.warning(f"Transformers not available: {e}")
                raise ImportError(
                    "Transformers not installed. Install with: pip install transformers"
                )
        return cls._transformers

    @classmethod
    def load_librosa(cls) -> Any:
        """Lazy load librosa"""
        if cls._librosa is None:
            try:
                cls._librosa = importlib.import_module("librosa")
                logger.info("Librosa loaded successfully")
            except ImportError as e:
                logger.warning(f"Librosa not available: {e}")
                raise ImportError(
                    "Librosa not installed. Install with: pip install librosa"
                )
        return cls._librosa

    @classmethod
    def load_cv2(cls) -> Any:
        """Lazy load OpenCV"""
        if cls._cv2 is None:
            try:
                cls._cv2 = importlib.import_module("cv2")
                logger.info("OpenCV loaded successfully")
            except ImportError as e:
                logger.warning(f"OpenCV not available: {e}")
                raise ImportError(
                    "OpenCV not installed. Install with: pip install opencv-python-headless"
                )
        return cls._cv2


# Convenience functions for common ML operations
def torch() -> Any:
    """Get torch module"""
    return LazyMLLoader.load_torch()


def torchvision() -> Any:
    """Get torchvision module"""
    return LazyMLLoader.load_torchvision()


def transformers() -> Any:
    """Get transformers module"""
    return LazyMLLoader.load_transformers()


def librosa() -> Any:
    """Get librosa module"""
    return LazyMLLoader.load_librosa()


def cv2() -> Any:
    """Get OpenCV module"""
    return LazyMLLoader.load_cv2()


# Optional agent framework loaders
def load_crewai() -> Any:
    """Lazy load CrewAI"""
    try:
        return importlib.import_module("crewai")
    except ImportError as e:
        logger.warning(f"CrewAI not available: {e}")
        raise ImportError("CrewAI not installed. Install with: pip install crewai")


def load_langchain() -> Any:
    """Lazy load LangChain"""
    try:
        return importlib.import_module("langchain_community")
    except ImportError as e:
        logger.warning(f"LangChain not available: {e}")
        raise ImportError(
            "LangChain not installed. Install with: pip install langchain-community"
        )
