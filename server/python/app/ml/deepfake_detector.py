"""Deepfake Detection ML Module - Scientific & Fast Implementation"""

import logging
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

import numpy as np
import cv2
import librosa


class DeepfakeDetector:
    """
    Scientific Deepfake Detection using Computer Vision and Signal Processing.
    - Image: LBP texture analysis, DCT frequency analysis, noise consistency
    - Audio: MFCC analysis, spectral features, compression artifacts
    - Video: Frame consistency analysis

    Fast & lightweight - no heavy ML models needed for baseline detection.
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

        self.is_loaded = True
        logger.info("Deepfake detector initialized with CV-based detection")

    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """CV-based deepfake detection using multiple techniques"""
        try:
            img = cv2.imread(image_path)
            if img is None:
                return {"result": "error", "message": "Failed to load image"}

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            scores = []
            method_details = []

            # 1. DCT Frequency Analysis - AI images have specific frequency patterns
            dct_score = self._analyze_dct_frequency(gray)
            scores.append(dct_score["score"])
            method_details.append(f"DCT: {dct_score['score']:.2f}")

            # 2. Local Binary Pattern - Texture inconsistency detection
            lbp_score = self._analyze_lbp_texture(gray)
            scores.append(lbp_score["score"])
            method_details.append(f"LBP: {lbp_score['score']:.2f}")

            # 3. Noise Consistency Analysis - AI generation leaves consistent noise patterns
            noise_score = self._analyze_noise_consistency(img)
            scores.append(noise_score["score"])
            method_details.append(f"Noise: {noise_score['score']:.2f}")

            # 4. Color Histogram Analysis
            color_score = self._analyze_color_distribution(img)
            scores.append(color_score["score"])
            method_details.append(f"Color: {color_score['score']:.2f}")

            # Weighted ensemble
            composite_score = (
                dct_score["score"] * 0.30
                + lbp_score["score"] * 0.25
                + noise_score["score"] * 0.30
                + color_score["score"] * 0.15
            )

            confidence = min(max(int(composite_score * 100), 10), 99)
            is_fake = confidence > (self.thresholds["image_fake_threshold"] * 100)

            flags = []
            if dct_score.get("anomaly"):
                flags.append("dct_frequency_anomaly")
            if lbp_score.get("anomaly"):
                flags.append("lbp_texture_artifact")
            if noise_score.get("anomaly"):
                flags.append("noise_inconsistency")
            if color_score.get("anomaly"):
                flags.append("color_distribution_anomaly")

            return {
                "result": "fake" if is_fake else "real",
                "confidence": confidence,
                "details": {
                    "method": "CV Ensemble (DCT+LBP+Noise+Color)",
                    "threshold_used": self.thresholds["image_fake_threshold"],
                    "method_scores": method_details,
                    "flags": flags,
                },
            }
        except Exception as e:
            logger.error(f"Image Analysis Error: {e}")
            return {"result": "error", "message": str(e)}

    def _analyze_dct_frequency(self, gray: np.ndarray) -> Dict[str, Any]:
        """DCT analysis - AI images have characteristic high-frequency patterns"""
        h, w = gray.shape
        # Resize to standard for consistent analysis
        gray = cv2.resize(gray, (256, 256))

        # 2D DCT
        dct = cv2.dct(np.float32(gray))

        # Analyze high-frequency coefficients
        # AI-generated images often have unusual HF energy distribution
        h, w = dct.shape
        center_h, center_w = h // 2, w // 2

        # High frequency regions (corners)
        hf_energy = (
            np.sum(np.abs(dct[:center_h, :center_w]))
            + np.sum(np.abs(dct[:center_h, center_w:]))
            + np.sum(np.abs(dct[center_h:, :center_w]))
            + np.sum(np.abs(dct[center_h:, center_w:]))
        )

        # Low frequency (center)
        lf_energy = np.sum(
            np.abs(dct[center_h - 20 : center_h + 20, center_w - 20 : center_w + 20])
        )

        ratio = hf_energy / (lf_energy + 1e-9)

        # AI images tend to have higher HF/LF ratio due to generation artifacts
        score = min(ratio / 50, 1.0)
        anomaly = score > 0.6

        return {"score": score, "ratio": ratio, "anomaly": anomaly}

    def _analyze_lbp_texture(self, gray: np.ndarray) -> Dict[str, Any]:
        """LBP texture analysis - detects synthetic texture patterns"""
        gray = cv2.resize(gray, (128, 128))

        # Simple LBP approximation using pixel comparisons
        h, w = gray.shape
        lbp = np.zeros((h - 2, w - 2), dtype=np.uint8)

        for i in range(1, h - 1):
            for j in range(1, w - 1):
                center = gray[i, j]
                code = 0
                code |= (gray[i - 1, j - 1] > center) << 7
                code |= (gray[i - 1, j] > center) << 6
                code |= (gray[i - 1, j + 1] > center) << 5
                code |= (gray[i, j + 1] > center) << 4
                code |= (gray[i + 1, j + 1] > center) << 3
                code |= (gray[i + 1, j] > center) << 2
                code |= (gray[i + 1, j - 1] > center) << 1
                code |= (gray[i, j - 1] > center) << 0
                lbp[i - 1, j - 1] = code

        # Calculate histogram
        hist, _ = np.histogram(lbp.ravel(), bins=256, range=(0, 256))
        hist = hist.astype(float) / hist.sum()

        # Calculate entropy - synthetic images often have lower entropy
        entropy = -np.sum(hist * np.log2(hist + 1e-9))

        # AI images tend to have more uniform/lower entropy textures
        score = 1.0 - (entropy / 8.0)  # Normalize
        anomaly = score > 0.55

        return {"score": score, "entropy": entropy, "anomaly": anomaly}

    def _analyze_noise_consistency(self, img: np.ndarray) -> Dict[str, Any]:
        """Noise pattern analysis - AI images have characteristic noise signatures"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, (256, 256))

        # Estimate noise using Laplacian
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        noise_std = laplacian.std()

        # Different regions should have similar noise levels in natural images
        h, w = gray.shape
        regions = [
            gray[: h // 2, : w // 2],
            gray[: h // 2, w // 2 :],
            gray[h // 2 :, : w // 2],
            gray[h // 2 :, w // 2 :],
        ]

        region_stds = [np.std(r) for r in regions]
        variance = np.var(region_stds)

        # AI images often have very consistent noise (generated together)
        # Natural images have more variance
        score = min(variance / 500, 1.0)
        anomaly = score < 0.3  # Low variance = suspicious

        return {"score": 1.0 - score, "variance": variance, "anomaly": anomaly}

    def _analyze_color_distribution(self, img: np.ndarray) -> Dict[str, Any]:
        """Color histogram analysis - AI images have unusual color distributions"""
        h, w = img.shape[:2]

        # Convert to different color spaces
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # Analyze hue distribution
        hist_h, _ = np.histogram(hsv[:, :, 0].ravel(), bins=36, range=(0, 180))
        hist_h = hist_h.astype(float) / hist_h.sum()

        # Calculate spread - AI images often have clustered hue distributions
        entropy_h = -np.sum(hist_h * np.log2(hist_h + 1e-9))

        # Analyze saturation - AI saturation often unnaturally high/low
        sat_mean = hsv[:, :, 1].mean() / 255.0

        # Analyze value/brightness distribution
        val_std = hsv[:, :, 2].std() / 255.0

        # Combined anomaly score
        score = 0.0
        if sat_mean > 0.7 or sat_mean < 0.1:
            score += 0.3
        if val_std < 0.2:
            score += 0.3
        if entropy_h < 3.5:
            score += 0.4

        anomaly = score > 0.5

        return {
            "score": score,
            "saturation": sat_mean,
            "entropy": entropy_h,
            "anomaly": anomaly,
        }

    def analyze_video(self, video_path: str) -> Dict[str, Any]:
        """Video deepfake detection using frame consistency analysis"""
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {"result": "error", "message": "Failed to open video"}

            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)

            if frame_count < 3:
                cap.release()
                # Fallback to image analysis if insufficient frames
                return self.analyze_image(video_path)

            # Sample frames for analysis (every Nth frame for speed)
            sample_indices = np.linspace(
                0, frame_count - 1, min(5, frame_count), dtype=int
            )
            frame_scores = []
            temporal_scores = []

            prev_gray = None
            for idx in sample_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if not ret:
                    continue

                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

                # Analyze each frame
                frame_result = self._quick_frame_analysis(gray)
                frame_scores.append(frame_result["score"])

                # Temporal consistency analysis
                if prev_gray is not None:
                    diff = cv2.absdiff(prev_gray, gray)
                    temporal_scores.append(diff.mean())
                prev_gray = gray

            cap.release()

            # Calculate consistency score
            frame_variance = np.var(frame_scores)
            temporal_consistency = (
                1.0 - (np.std(temporal_scores) / 255.0) if temporal_scores else 0.5
            )

            # Fake videos often have inconsistent frames
            avg_score = np.mean(frame_scores)

            # If frames vary too much or too little, suspicious
            if frame_variance > 0.15:
                avg_score = min(avg_score + 0.2, 1.0)

            confidence = min(max(int(avg_score * 100), 10), 99)
            is_fake = confidence > (self.thresholds["video_fake_threshold"] * 100)

            return {
                "result": "fake" if is_fake else "real",
                "confidence": confidence,
                "details": {
                    "method": "Frame Consistency Analysis",
                    "threshold_used": self.thresholds["video_fake_threshold"],
                    "frames_analyzed": len(frame_scores),
                    "frame_variance": round(frame_variance, 3),
                    "temporal_consistency": round(temporal_consistency, 3),
                    "flags": ["temporal_inconsistency"]
                    if frame_variance > 0.15
                    else [],
                },
            }
        except Exception as e:
            logger.error(f"Video Analysis Error: {e}")
            return {"result": "error", "message": str(e)}

    def _quick_frame_analysis(self, gray: np.ndarray) -> Dict[str, Any]:
        """Quick per-frame analysis for video"""
        gray = cv2.resize(gray, (128, 128))

        # Quick noise analysis
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        noise_score = min(laplacian.std() / 50, 1.0)

        return {"score": noise_score}

    def analyze_audio(self, audio_path: str) -> Dict[str, Any]:
        """Fast audio deepfake detection using librosa signal analysis"""
        try:
            audio_data, sample_rate = librosa.load(audio_path, sr=16000)

            if len(audio_data) == 0:
                return {"result": "error", "message": "Empty audio file"}

            scores = []
            method_details = []

            # 1. MFCC Analysis - AI audio has characteristic MFCC patterns
            mfcc_result = self._analyze_mfcc(audio_data, sample_rate)
            scores.append(mfcc_result["score"])
            method_details.append(f"MFCC: {mfcc_result['score']:.2f}")

            # 2. Spectral Analysis
            spectral_result = self._analyze_spectral_features(audio_data, sample_rate)
            scores.append(spectral_result["score"])
            method_details.append(f"Spectral: {spectral_result['score']:.2f}")

            # 3. Compression Artifacts - AI audio often has specific artifacts
            compression_result = self._analyze_compression_artifacts(
                audio_data, sample_rate
            )
            scores.append(compression_result["score"])
            method_details.append(f"Compression: {compression_result['score']:.2f}")

            # 4. Pitch/Formant Analysis
            pitch_result = self._analyze_pitch_formants(audio_data, sample_rate)
            scores.append(pitch_result["score"])
            method_details.append(f"Pitch: {pitch_result['score']:.2f}")

            # Weighted ensemble
            composite_score = (
                mfcc_result["score"] * 0.30
                + spectral_result["score"] * 0.25
                + compression_result["score"] * 0.25
                + pitch_result["score"] * 0.20
            )

            confidence = min(max(int(composite_score * 100), 10), 99)
            is_fake = confidence > (self.thresholds["audio_fake_threshold"] * 100)

            flags = []
            if mfcc_result.get("anomaly"):
                flags.append("mfcc_anomaly")
            if spectral_result.get("anomaly"):
                flags.append("spectral_irregularity")
            if compression_result.get("anomaly"):
                flags.append("compression_artifact")
            if pitch_result.get("anomaly"):
                flags.append("pitch_anomaly")

            return {
                "result": "fake" if is_fake else "real",
                "confidence": confidence,
                "details": {
                    "method": "Audio Signal Ensemble (MFCC+Spectral+Compression+Pitch)",
                    "threshold_used": self.thresholds["audio_fake_threshold"],
                    "sample_rate": sample_rate,
                    "duration": round(len(audio_data) / sample_rate, 2),
                    "method_scores": method_details,
                    "flags": flags,
                },
            }
        except Exception as e:
            logger.error(f"Audio Analysis Error: {e}")
            return {"result": "error", "message": str(e)}

    def _analyze_mfcc(self, audio_data: np.ndarray, sr: int) -> Dict[str, Any]:
        """Analyze MFCC features for deepfake patterns"""
        mfccs = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=13)

        # Calculate statistics
        mfcc_mean = np.mean(mfccs, axis=1)
        mfcc_std = np.std(mfccs, axis=1)
        mfcc_delta = np.diff(mfccs, axis=1)

        # AI audio tends to have:
        # - Unusual MFCC variance
        # - Lower delta energy (over-smoothed)
        delta_energy = np.mean(np.abs(mfcc_delta))
        variance_score = np.std(mfcc_mean)

        # Normalize scores
        score = min((0.3 * variance_score) + (0.7 * (1.0 - delta_energy / 10)), 1.0)
        anomaly = score > 0.6 or delta_energy < 2.0

        return {"score": score, "delta_energy": delta_energy, "anomaly": anomaly}

    def _analyze_spectral_features(
        self, audio_data: np.ndarray, sr: int
    ) -> Dict[str, Any]:
        """Analyze spectral features for AI artifacts"""
        # Spectral centroid
        spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sr)[0]
        centroid_mean = np.mean(spectral_centroid)
        centroid_std = np.std(spectral_centroid)

        # Spectral contrast
        spectral_contrast = librosa.feature.spectral_contrast(y=audio_data, sr=sr)
        contrast_mean = np.mean(spectral_contrast)

        # Spectral flatness - AI audio often has unusual flatness
        spectral_flatness = librosa.feature.spectral_flatness(y=audio_data)[0]
        flatness_mean = np.mean(spectral_flatness)

        # AI audio often has:
        # - Unusual spectral centroid (too steady or too variable)
        # - Lower contrast (over-processed)
        # - Abnormal flatness

        score = 0.0
        if centroid_std < 200:
            score += 0.3  # Too steady
        if contrast_mean < 20:
            score += 0.3  # Low contrast
        if flatness_mean > 0.4 or flatness_mean < 0.1:
            score += 0.4  # Abnormal flatness

        anomaly = score > 0.5

        return {
            "score": score,
            "centroid": centroid_mean,
            "flatness": flatness_mean,
            "anomaly": anomaly,
        }

    def _analyze_compression_artifacts(
        self, audio_data: np.ndarray, sr: int
    ) -> Dict[str, Any]:
        """Analyze for compression artifacts characteristic of AI generation"""
        # High-frequency content analysis
        fft = np.fft.rfft(audio_data)
        magnitude = np.abs(fft)
        freqs = np.fft.rfftfreq(len(audio_data), 1 / sr)

        # Split into bands
        hf_mask = freqs > 8000
        mf_mask = (freqs > 2000) & (freqs <= 8000)
        lf_mask = freqs <= 2000

        hf_energy = np.sum(magnitude[hf_mask] ** 2)
        mf_energy = np.sum(magnitude[mf_mask] ** 2)
        lf_energy = np.sum(magnitude[lf_mask] ** 2)

        total_energy = hf_energy + mf_energy + lf_energy + 1e-9

        # AI-generated audio often has unusual HF/MF ratios
        hf_ratio = hf_energy / total_energy
        mf_ratio = mf_energy / total_energy

        score = 0.0
        if hf_ratio < 0.05:  # Missing high frequencies = suspicious
            score += 0.4
        if hf_ratio > 0.4:  # Too much high frequency = suspicious
            score += 0.3
        if mf_ratio > 0.7:  # Over-emphasized mid frequencies
            score += 0.3

        anomaly = score > 0.5

        return {
            "score": score,
            "hf_ratio": hf_ratio,
            "mf_ratio": mf_ratio,
            "anomaly": anomaly,
        }

    def _analyze_pitch_formants(
        self, audio_data: np.ndarray, sr: int
    ) -> Dict[str, Any]:
        """Analyze pitch and formants for naturalness"""
        try:
            # Extract pitch using librosa's piptrack
            pitches, magnitudes = librosa.piptrack(y=audio_data, sr=sr)

            # Get pitch values above threshold
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:
                    pitch_values.append(pitch)

            if not pitch_values:
                return {"score": 0.5, "anomaly": False}

            pitch_mean = np.mean(pitch_values)
            pitch_std = np.std(pitch_values)
            pitch_range = max(pitch_values) - min(pitch_values)

            # Natural speech:
            # - Varied pitch (std > 30)
            # - Realistic range (50-500 Hz for speech)

            score = 0.0
            if pitch_std < 20:
                score += 0.4  # Too steady = suspicious
            if pitch_range < 50:
                score += 0.3  # Too narrow = suspicious
            if pitch_mean < 60 or pitch_mean > 400:
                score += 0.3  # Unrealistic pitch

            anomaly = score > 0.5

            return {
                "score": score,
                "pitch_mean": pitch_mean,
                "pitch_std": pitch_std,
                "anomaly": anomaly,
            }
        except Exception:
            return {"score": 0.5, "anomaly": False}


# Singleton instance
deepfake_detector = DeepfakeDetector()
