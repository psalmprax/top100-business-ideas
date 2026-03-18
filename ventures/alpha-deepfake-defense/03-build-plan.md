# Build Plan: LivenessLink Infrastructure

## 🛠️ Tech Stack
- **Mobile**: Flutter with Native plugins for Biometric Secure Enclave access.
- **Backend**: Go (for high-security, performant signature verification).
- **Cryptographic Engine**: WebCrypto API + OpenSSL for RSA-PSS signing.
- **Network**: WebRTC with encrypted data channels for the "handshake" info.

## 📋 MVP Core Requirements
1.  **Secure Signer**: A mobile app that generates a 30-second time-weighted cryptographic key based on FaceID/TouchID.
2.  **Verifier Portal**: A web app where an employee pastes a code from the Boss's app to confirm "Yes, this person is live and authorized."
3.  **Voice Artifact Detector**: A lightweight Python microservice that checks for 48kHz vs 24kHz (common in AI models) audio discrepancies.

## 📦 Key Deliverables
- [ ] iOS/Android Liveness Signer.
- [ ] Treasury Approval Dashboard.
- [ ] Browser Extension for Zoom/Teams (Overlaying "Verified" status).
