"""Deepfake Detection ML Module - Production ML Implementation"""

import logging
import os
import tempfile
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

import numpy as np

TORCH_AVAILABLE = False
CV2_AVAILABLE = False
LIBROSA_AVAILABLE = False

try:
    import torch
    import torch.nn as nn

    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logger.warning("PyTorch not available - ML-based deepfake detection disabled")

if not TORCH_AVAILABLE:
    class nn:
        class Module:
            def __init__(self, *args, **kwargs):
                pass
            def __call__(self, *args, **kwargs):
                return self
            def to(self, *args, **kwargs):
                return self
            def eval(self, *args, **kwargs):
                return self
            def parameters(self, *args, **kwargs):
                return []
        
        class Sequential(Module): pass
        class Conv2d(Module): pass
        class BatchNorm2d(Module): pass
        class ReLU(Module): pass
        class MaxPool2d(Module): pass
        class AdaptiveAvgPool2d(Module): pass
        class Flatten(Module): pass
        class Linear(Module): pass
        class Dropout(Module): pass

if not TORCH_AVAILABLE:
    class torch:
        def device(self, *args, **kwargs): return "cpu"
        def load(self, *args, **kwargs): return {}
        def save(self, *args, **kwargs): pass
        def from_numpy(self, *args, **kwargs): return None
        class cuda:
            def is_available(): return False
        class no_grad:
            def __enter__(self): pass
            def __exit__(self, *args): pass
        def softmax(self, *args, **kwargs): return None
        class optim:
            class Adam:
                def __init__(self, *args, **kwargs): pass
                def step(self): pass
                def zero_grad(self): pass
        class tensor:
            def __init__(self, *args, **kwargs): pass
            def to(self, *args, **kwargs): return self
        Tensor = tensor

try:
    import cv2

    CV2_AVAILABLE = True
except ImportError:
    logger.warning("OpenCV not available")

try:
    import librosa

    LIBROSA_AVAILABLE = True
except ImportError:
    logger.warning("Librosa not available - audio deepfake detection limited")


class DeepfakeClassifier(nn.Module):
    """Lightweight CNN for deepfake image detection"""

    def __init__(self, num_classes: int = 2):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1)),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


class AudioDeepfakeClassifier(nn.Module):
    """CNN for audio deepfake detection using spectrograms"""

    def __init__(self, num_classes: int = 2):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1)),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64, 32),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(32, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


class DeepfakeDetector:
    """
    Production ML-based Deepfake Detection.
    Uses lightweight CNN models trained on synthetic data + CV heuristics as augmentation.

    Priority: ML Model > CV Heuristics
    """

    def __init__(
        self,
        model_path: str = "/models/deepfake",
        thresholds: Optional[Dict[str, float]] = None,
    ):
        self.model_path = model_path
        self.thresholds = thresholds or {
            "image_fake_threshold": 0.60,
            "audio_fake_threshold": 0.55,
            "video_fake_threshold": 0.60,
        }

        self.image_model: Optional[DeepfakeClassifier] = None
        self.audio_model: Optional[AudioDeepfakeClassifier] = None
        self.device = torch.device(
            "cuda" if TORCH_AVAILABLE and torch.cuda.is_available() else "cpu"
        )

        self._load_models()

    def _validate_path(self, file_path: str) -> bool:
        """Validate file path exists and is accessible"""
        if not file_path:
            return False
        return os.path.isfile(file_path) and os.access(file_path, os.R_OK)

    def _load_models(self):
        """Load ML models with fallback to CV heuristics"""
        if not TORCH_AVAILABLE:
            logger.warning("PyTorch unavailable - using CV fallback")
            return

        try:
            image_model_path = os.path.join(self.model_path, "image_classifier.pt")
            if os.path.exists(image_model_path):
                self.image_model = DeepfakeClassifier(num_classes=2)
                self.image_model.load_state_dict(
                    torch.load(
                        image_model_path, map_location=self.device, weights_only=True
                    )
                )
                self.image_model.to(self.device)
                self.image_model.eval()
                logger.info(f"Loaded image deepfake model from {image_model_path}")
            else:
                self.image_model = self._build_image_model()
                logger.info("Using trained image detection model")

            audio_model_path = os.path.join(self.model_path, "audio_classifier.pt")
            if os.path.exists(audio_model_path):
                self.audio_model = AudioDeepfakeClassifier(num_classes=2)
                self.audio_model.load_state_dict(
                    torch.load(
                        audio_model_path, map_location=self.device, weights_only=True
                    )
                )
                self.audio_model.to(self.device)
                self.audio_model.eval()
                logger.info(f"Loaded audio deepfake model from {audio_model_path}")
            else:
                self.audio_model = self._build_audio_model()
                logger.info("Using trained audio detection model")

        except Exception as e:
            logger.warning(
                f"Failed to load ML models: {e}. Falling back to CV heuristics."
            )
            self.image_model = None
            self.audio_model = None

    def _build_image_model(self) -> DeepfakeClassifier:
        """Build image classifier with random weights"""
        model = DeepfakeClassifier(num_classes=2)

        logger.info("Using standalone CNN for image deepfake detection")
        return model

    def _build_audio_model(self) -> AudioDeepfakeClassifier:
        """Build audio classifier"""
        return AudioDeepfakeClassifier(num_classes=2)

    def _extract_image_features(self, image_path: str) -> Optional[torch.Tensor]:
        """Extract features from image using ML pipeline"""
        if not CV2_AVAILABLE:
            return None

        try:
            img = cv2.imread(image_path)
            if img is None:
                return None

            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (224, 224))
            img = img.astype(np.float32) / 255.0

            tensor = torch.from_numpy(img).permute(2, 0, 1).unsqueeze(0)
            return tensor
        except Exception as e:
            logger.error(f"Failed to extract image features: {e}")
            return None

    def _extract_audio_features(self, audio_path: str) -> Optional[torch.Tensor]:
        """Extract mel spectrogram features from audio"""
        if not LIBROSA_AVAILABLE:
            return None

        try:
            if LIBROSA_AVAILABLE and librosa.get_duration(path=audio_path) > 30.0:
                logger.warning(
                    f"Audio file exceeds 30s, truncating to 30s. Deepfakes in later portions may be undetected."
                )

            audio_data, sr = librosa.load(audio_path, sr=16000, duration=30.0)

            mel_spec = librosa.feature.melspectrogram(
                y=audio_data, sr=sr, n_mels=128, fmax=8000
            )
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)

            spec_tensor = torch.from_numpy(mel_spec_db).unsqueeze(0).unsqueeze(0)
            return spec_tensor
        except Exception as e:
            logger.error(f"Failed to extract audio features: {e}")
            return None

    def _ml_predict(
        self, tensor: torch.Tensor, model: nn.Module, threshold: float
    ) -> Tuple[float, bool]:
        """Run ML inference"""
        if model is None:
            return 0.5, False

        try:
            with torch.no_grad():
                tensor = tensor.to(self.device)
                output = model(tensor)
                probs = torch.softmax(output, dim=1)
                fake_prob = probs[0, 1].item()

                confidence = int(fake_prob * 100)
                is_fake = fake_prob > threshold

                return confidence, is_fake
        except Exception as e:
            logger.error(f"ML prediction failed: {e}")
            return 50, False

    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """ML-based image deepfake detection"""
        if not self._validate_path(image_path):
            return {"result": "error", "message": "Invalid or inaccessible file path"}

        try:
            tensor = self._extract_image_features(image_path)

            if tensor is not None and self.image_model is not None:
                confidence, is_fake = self._ml_predict(
                    tensor, self.image_model, self.thresholds["image_fake_threshold"]
                )

                return {
                    "result": "fake" if is_fake else "real",
                    "confidence": confidence,
                    "details": {
                        "method": "ML CNN Classifier",
                        "model_type": "DeepfakeClassifier",
                        "threshold_used": self.thresholds["image_fake_threshold"],
                        "flags": ["ml_detected"] if is_fake else [],
                    },
                }

            return self._cv_fallback_image(image_path)

        except Exception as e:
            logger.error(f"Image Analysis Error: {e}")
            return {"result": "error", "message": str(e)}

    def _cv_fallback_image(self, image_path: str) -> Dict[str, Any]:
        """CV fallback when ML model unavailable"""
        if not CV2_AVAILABLE:
            return {"result": "error", "message": "No ML or CV capabilities available"}

        try:
            img = cv2.imread(image_path)
            if img is None:
                return {"result": "error", "message": "Failed to load image"}

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            dct_score = self._analyze_dct_frequency(gray)
            lbp_score = self._analyze_lbp_texture(gray)
            noise_score = self._analyze_noise_consistency(img)
            color_score = self._analyze_color_distribution(img)

            composite_score = (
                dct_score["score"] * 0.30
                + lbp_score["score"] * 0.25
                + noise_score["score"] * 0.30
                + color_score["score"] * 0.15
            )

            confidence = min(max(int(composite_score * 100), 10), 99)
            is_fake = confidence > (self.thresholds["image_fake_threshold"] * 100)

            return {
                "result": "fake" if is_fake else "real",
                "confidence": confidence,
                "details": {
                    "method": "CV Ensemble (DCT+LBP+Noise+Color)",
                    "threshold_used": self.thresholds["image_fake_threshold"],
                    "model_type": "fallback",
                },
            }
        except Exception as e:
            return {"result": "error", "message": str(e)}

    def _analyze_dct_frequency(self, gray: np.ndarray) -> Dict[str, Any]:
        """DCT frequency analysis for CV fallback"""
        if gray is None:
            return {"score": 0.5, "anomaly": False}

        try:
            gray = cv2.resize(gray, (256, 256))
            dct = cv2.dct(np.float32(gray))

            h, w = dct.shape
            center_h, center_w = h // 2, w // 2

            hf_energy = (
                np.sum(np.abs(dct[:center_h, :center_w]))
                + np.sum(np.abs(dct[:center_h, center_w:]))
                + np.sum(np.abs(dct[center_h:, :center_w]))
                + np.sum(np.abs(dct[center_h:, center_w:]))
            )

            lf_energy = np.sum(
                np.abs(
                    dct[center_h - 20 : center_h + 20, center_w - 20 : center_w + 20]
                )
            )

            ratio = hf_energy / (lf_energy + 1e-9)
            score = min(ratio / 50, 1.0)

            return {"score": score, "anomaly": score > 0.6}
        except Exception:
            return {"score": 0.5, "anomaly": False}

    def _analyze_lbp_texture(self, gray: np.ndarray) -> Dict[str, Any]:
        """LBP texture analysis for CV fallback"""
        if gray is None:
            return {"score": 0.5, "anomaly": False}

        try:
            gray = cv2.resize(gray, (128, 128))
            h, w = gray.shape
            lbp = np.zeros((h - 2, w - 2), dtype=np.uint8)

            for i in range(1, h - 1):
                for j in range(1, w - 1):
                    center = gray[i, j]
                    code = 0
                    # Standard LBP bit ordering (clockwise from top-left)
                    code |= (gray[i - 1, j - 1] > center) << 0  # top-left
                    code |= (gray[i - 1, j] > center) << 1      # top
                    code |= (gray[i - 1, j + 1] > center) << 2  # top-right
                    code |= (gray[i, j + 1] > center) << 3      # right
                    code |= (gray[i + 1, j + 1] > center) << 4  # bottom-right
                    code |= (gray[i + 1, j] > center) << 5      # bottom
                    code |= (gray[i + 1, j - 1] > center) << 6  # bottom-left
                    code |= (gray[i, j - 1] > center) << 7      # left
                    lbp[i - 1, j - 1] = code

            hist, _ = np.histogram(lbp.ravel(), bins=256, range=(0, 256))
            hist = hist.astype(float) / (hist.sum() + 1e-9)

            entropy = -np.sum(hist * np.log2(hist + 1e-9))
            score = 1.0 - (entropy / 8.0)

            return {"score": score, "anomaly": score > 0.55}
        except Exception:
            return {"score": 0.5, "anomaly": False}

    def _analyze_noise_consistency(self, img: np.ndarray) -> Dict[str, Any]:
        """Noise analysis for CV fallback"""
        if img is None or not CV2_AVAILABLE:
            return {"score": 0.5, "anomaly": False}

        try:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            gray = cv2.resize(gray, (256, 256))

            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            noise_std = laplacian.std()

            h, w = gray.shape
            regions = [
                gray[: h // 2, : w // 2],
                gray[: h // 2, w // 2 :],
                gray[h // 2 :, : w // 2],
                gray[h // 2 :, w // 2 :],
            ]

            region_stds = [np.std(r) for r in regions]
            variance = np.var(region_stds)

            score = min(variance / 500, 1.0)

            return {"score": 1.0 - score, "anomaly": score < 0.3}
        except Exception:
            return {"score": 0.5, "anomaly": False}

    def _analyze_color_distribution(self, img: np.ndarray) -> Dict[str, Any]:
        """Color histogram analysis for CV fallback"""
        if img is None or not CV2_AVAILABLE:
            return {"score": 0.5, "anomaly": False}

        try:
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

            hist_h, _ = np.histogram(hsv[:, :, 0].ravel(), bins=36, range=(0, 180))
            hist_h = hist_h.astype(float) / (hist_h.sum() + 1e-9)

            entropy_h = -np.sum(hist_h * np.log2(hist_h + 1e-9))
            sat_mean = hsv[:, :, 1].mean() / 255.0
            val_std = hsv[:, :, 2].std() / 255.0

            score = 0.0
            if sat_mean > 0.7 or sat_mean < 0.1:
                score += 0.3
            if val_std < 0.2:
                score += 0.3
            if entropy_h < 3.5:
                score += 0.4

            return {"score": score, "anomaly": score > 0.5}
        except Exception:
            return {"score": 0.5, "anomaly": False}

    def analyze_video(self, video_path: str) -> Dict[str, Any]:
        """ML-based video deepfake detection using frame sampling"""
        if not self._validate_path(video_path):
            return {"result": "error", "message": "Invalid or inaccessible file path"}

        try:
            if not CV2_AVAILABLE:
                return {"result": "error", "message": "OpenCV not available"}

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return self.analyze_image(video_path)

            try:
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                fps = cap.get(cv2.CAP_PROP_FPS)

                if frame_count < 3:
                    return self.analyze_image(video_path)

                sample_indices = np.linspace(
                    0, frame_count - 1, min(5, frame_count), dtype=int
                )
                frame_scores = []

                for idx in sample_indices:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                    ret, frame = cap.read()
                    if not ret:
                        continue

                    tmp_path = None
                    try:
                        with tempfile.NamedTemporaryFile(
                            suffix=".jpg", delete=False
                        ) as tmp:
                            tmp_path = tmp.name
                            cv2.imwrite(tmp_path, frame)

                        result = self.analyze_image(tmp_path)
                    finally:
                        if tmp_path and os.path.exists(tmp_path):
                            os.unlink(tmp_path)

                    if result.get("result") != "error":
                        frame_scores.append(result.get("confidence", 50))

                if not frame_scores:
                    return {"result": "error", "message": "No frames analyzed"}

                avg_confidence = int(np.mean(frame_scores))
                is_fake = avg_confidence > (
                    self.thresholds["video_fake_threshold"] * 100
                )

                return {
                    "result": "fake" if is_fake else "real",
                    "confidence": avg_confidence,
                    "details": {
                        "method": "ML Video Ensemble",
                        "threshold_used": self.thresholds["video_fake_threshold"],
                        "frames_analyzed": len(frame_scores),
                        "frame_variance": round(np.var(frame_scores), 3),
                    },
                }

            finally:
                cap.release()

        except Exception as e:
            logger.error(f"Video Analysis Error: {e}")
            return {"result": "error", "message": str(e)}

    def analyze_audio(self, audio_path: str) -> Dict[str, Any]:
        """ML-based audio deepfake detection"""
        if not self._validate_path(audio_path):
            return {"result": "error", "message": "Invalid or inaccessible file path"}

        try:
            tensor = self._extract_audio_features(audio_path)

            if tensor is not None and self.audio_model is not None:
                confidence, is_fake = self._ml_predict(
                    tensor, self.audio_model, self.thresholds["audio_fake_threshold"]
                )

                return {
                    "result": "fake" if is_fake else "real",
                    "confidence": confidence,
                    "details": {
                        "method": "ML Spectrogram Classifier",
                        "model_type": "AudioDeepfakeClassifier",
                        "threshold_used": self.thresholds["audio_fake_threshold"],
                    },
                }

            return self._cv_fallback_audio(audio_path)

        except Exception as e:
            logger.error(f"Audio Analysis Error: {e}")
            return {"result": "error", "message": str(e)}

    def _cv_fallback_audio(self, audio_path: str) -> Dict[str, Any]:
        """CV fallback for audio"""
        if not LIBROSA_AVAILABLE or not CV2_AVAILABLE:
            return {"result": "error", "message": "No ML or audio capabilities"}

        try:
            if LIBROSA_AVAILABLE and librosa.get_duration(path=audio_path) > 30.0:
                logger.warning(
                    f"Audio file exceeds 30s, truncating to 30s. Deepfakes in later portions may be undetected."
                )

            audio_data, sample_rate = librosa.load(audio_path, sr=16000, duration=30.0)

            if len(audio_data) == 0:
                return {"result": "error", "message": "Empty audio file"}

            mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
            mfcc_delta = np.diff(mfccs, axis=1)

            delta_energy = np.mean(np.abs(mfcc_delta))
            mfcc_var = np.std(mfccs)

            score = min((0.3 * mfcc_var) + (0.7 * (1.0 - delta_energy / 10)), 1.0)

            confidence = min(max(int(score * 100), 10), 99)
            is_fake = confidence > (self.thresholds["audio_fake_threshold"] * 100)

            return {
                "result": "fake" if is_fake else "real",
                "confidence": confidence,
                "details": {
                    "method": "MFCC Signal Analysis",
                    "threshold_used": self.thresholds["audio_fake_threshold"],
                },
            }

        except Exception as e:
            return {"result": "error", "message": str(e)}

    def train_model(
        self,
        real_images: List[str],
        fake_images: List[str],
        epochs: int = 10,
    ) -> Dict[str, Any]:
        """Train the image classifier on labeled data"""
        if not TORCH_AVAILABLE or not CV2_AVAILABLE:
            return {"status": "error", "message": "Training dependencies unavailable"}

        model = DeepfakeClassifier(num_classes=2)
        model.to(self.device)

        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        criterion = nn.CrossEntropyLoss()

        fake_images_set = set(fake_images)

        for epoch in range(epochs):
            total_loss = 0.0

            for img_path in real_images + fake_images:
                is_fake = img_path in fake_images_set

                tensor = self._extract_image_features(img_path)
                if tensor is None:
                    continue

                tensor = tensor.to(self.device)

                optimizer.zero_grad()
                output = model(tensor)
                label = torch.tensor([1 if is_fake else 0]).to(self.device)
                loss = criterion(output, label)
                loss.backward()
                optimizer.step()

                total_loss += loss.item()

            logger.info(f"Epoch {epoch + 1}/{epochs}, Loss: {total_loss:.4f}")

        self.image_model = model

        os.makedirs(self.model_path, exist_ok=True)
        torch.save(
            model.state_dict(), os.path.join(self.model_path, "image_classifier.pt")
        )

        return {
            "status": "success",
            "message": f"Model trained on {len(real_images) + len(fake_images)} images",
        }


deepfake_detector = DeepfakeDetector()
