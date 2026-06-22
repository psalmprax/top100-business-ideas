# Competitive Override Use Cases: LivenessLink (Treasury Defense)

Current deepfake defense relies on "Detection" APIs (like Reality Defender) that analyze a video to guess if it's fake. In a high-stakes Treasury environment, guessing isn't good enough. **LivenessLink** shifts the paradigm from _Detection_ to _Cryptographic Authentication_.

Here are the specific use cases where LivenessLink surpasses the competition:

## Use Case 1: The "CEO Video Ransom" Override

**The Competitor Way**: An API analyzes the Zoom call in real-time. If the deepfake model is newer than the detection model, the fake CEO passes the test, and the $25M wire is sent.
**The Sentinel Override**: "Zero-Trust Visuals." It does not matter how realistic the video looks or sounds. To authorize a transfer over $1M, the CEO _must_ open the LivenessLink app on their registered iPhone and authenticate via FaceID Secure Enclave. This generates a time-stamped cryptographic signature that visually unlocks the transaction on the Treasurer's screen. If there is no signature, the video is treated as hostile.

## Use Case 2: Multi-Sig Biometric Board Approvals (M&A Transfers)

**The Competitor Way**: Sending a DocuSign link to three board members via email (which can be intercepted via Business Email Compromise - BEC) to approve a massive acquisition wire.
**The Sentinel Override**: A synchronized, biometric multisig. The transaction remains cryptographically locked in the Treasury ERP (like Kyriba). All three board members must perform a "Liveness Check" via the app simultaneously (or within a tight 5-minute window). The app proves _Presence_ and _Identity_, entirely bypassing email vulnerabilities.

## Use Case 3: The "Panic Word" Silent Alarm

**The Competitor Way**: A physical bank token (RSA SecurID) generates a code. If an attacker physically coerces the CFO, they can just read the code and authorize the transfer.
**The Sentinel Override**: LivenessLink incorporates a "Silent Alarm" biometric profile. If the CFO is under duress (e.g., a "Tiger Kidnapping"), they use their index finger instead of their thumb for the TouchID verification, or they speak a predefined "Panic Phrase" during the voice verification. The system _appears_ to approve the transaction to the attacker, but silently routes the money to a frozen escrow account and alerts authorities.
