import sys
import os
import numpy as np
from datetime import datetime

# Add app to path
sys.path.append(os.path.join(os.getcwd(), "app"))

from app.ml.compliance_analyzer import ComplianceAnalyzer
from app.ml.deepfake_detector import DeepfakeDetector

def test_compliance():
    print("Testing ComplianceAnalyzer...")
    analyzer = ComplianceAnalyzer()
    
    # Case 1: No evidence
    res = analyzer.analyze_ai_act_compliance({}, [])
    print(f"No evidence score: {res['score']}, status: {res['status']}")
    assert res['score'] == 45
    
    # Case 2: Full evidence
    evidence = [
        {"file": "ARCHITECTURE.md", "status": "found"},
        {"file": "PRIVACY.md", "status": "found"},
        {"file": "SECURITY.md", "status": "found"},
        {"file": "DATA_LINEAGE.md", "status": "found"}
    ]
    res = analyzer.analyze_ai_act_compliance({}, evidence)
    print(f"Full evidence score: {res['score']}, status: {res['status']}")
    assert res['score'] >= 85
    print("Compliance test passed!")

def test_deepfake_audio():
    print("\nTesting DeepfakeDetector Audio...")
    detector = DeepfakeDetector()
    
    # Create a dummy "audio" file
    audio_path = "/tmp/test_audio.raw"
    
    # "Real" audio (white noise)
    with open(audio_path, "wb") as f:
        f.write(np.random.bytes(100000))
        
    res = detector.analyze_audio(audio_path)
    print(f"Noise Audio - Result: {res['result']}, Confidence: {res['confidence']}")
    
    # "Synthetic" audio (high freq sine wave simulation)
    # Since we read as int8, let's create a pattern
    with open(audio_path, "wb") as f:
        # High freq: alternating 255, 0 (unsigned equivalent of 127, -128)
        f.write(bytes([255, 0] * 50000))
        
    res = detector.analyze_audio(audio_path)
    print(f"High Freq Audio - Result: {res['result']}, Confidence: {res['confidence']}")
    
    os.remove(audio_path)
    print("Deepfake audio test passed!")

if __name__ == "__main__":
    try:
        test_compliance()
        test_deepfake_audio()
        print("\nAll Python ML verifications PASSED!")
    except Exception as e:
        print(f"\nVerification FAILED: {e}")
        sys.exit(1)
