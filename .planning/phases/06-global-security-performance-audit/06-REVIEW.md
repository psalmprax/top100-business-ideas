---
phase: 06-global-security-performance-audit
reviewed: 2026-04-10T16:29:17+02:00
depth: standard
files_reviewed: 1
files_reviewed_list:
  - server/python/app/ml/deepfake_detector.py
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-04-10T16:29:17+02:00
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

The deepfake detector module implements ML-based and CV-based deepfake detection for images, audio, and video. The code has proper error handling, graceful fallbacks when ML libraries are unavailable, and uses secure practices like `weights_only=True` for model loading. Two warnings and two info-level issues were identified.

## Warnings

### WR-01: Incorrect LBP Bit Ordering

**File:** `server/python/app/ml/deepfake_detector.py:379-391`
**Issue:** The Local Binary Pattern (LBP) implementation has incorrect bit ordering. The current code assigns comparison results to bits 7-0 in reading order (top-left to bottom-right), but standard LBP assigns bits based on spatial position around the center pixel. This causes the texture analysis to produce incorrect entropy scores, potentially leading to false positives/negatives in the CV fallback detection.

**Fix:**

```python
# Standard LBP bit ordering (clockwise from top-left)
code |= (gray[i - 1, j - 1] > center) << 0  # top-left
code |= (gray[i - 1, j] > center) << 1      # top
code |= (gray[i - 1, j + 1] > center) << 2  # top-right
code |= (gray[i, j + 1] > center) << 3      # right
code |= (gray[i + 1, j + 1] > center) << 4  # bottom-right
code |= (gray[i + 1, j] > center) << 5      # bottom
code |= (gray[i + 1, j - 1] > center) << 6  # bottom-left
code |= (gray[i, j - 1] > center) << 7      # left
```

### WR-02: Audio Truncation Without Warning

**File:** `server/python/app/ml/deepfake_detector.py:233, 567`
**Issue:** Audio files longer than 30 seconds are silently truncated when extracting features. This can cause deepfakes in longer audio segments to go undetected, especially if the synthetic portion is beyond the 30-second mark.

**Fix:**

```python
# In _extract_audio_features and _cv_fallback_audio, add a warning:
if librosa.get_duration(path=audio_path) > 30.0:
    logger.warning(f"Audio file exceeds 30s, truncating to 30s. Deepfakes in later portions may be undetected.")
audio_data, sr = librosa.load(audio_path, sr=16000, duration=30.0)
```

## Info

### IN-01: Unused Global Flag

**File:** `server/python/app/ml/deepfake_detector.py:26-31`
**Issue:** `TRANSFORMERS_AVAILABLE` is set based on import success but never used in the codebase. This is dead code.

**Fix:** Remove the `TRANSFORMERS_AVAILABLE` flag and its associated try/except block, or implement transformer-based detection as intended.

### IN-02: Misleading Method Names

**File:** `server/python/app/ml/deepfake_detector.py:196-205`
**Issue:** Methods `_build_pretrained_image_model` and `_build_pretrained_audio_model` suggest they load pre-trained weights, but they actually create new randomly-initialized models. This is misleading.

**Fix:** Rename to `_build_image_model` and `_build_audio_model`, or implement actual pretrained weight loading:

```python
def _build_pretrained_image_model(self) -> DeepfakeClassifier:
    """Build image classifier with random weights"""
    model = DeepfakeClassifier(num_classes=2)
    logger.info("Using randomly initialized CNN for image deepfake detection")
    return model
```

---

_Reviewed: 2026-04-10T16:29:17+02:00_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
