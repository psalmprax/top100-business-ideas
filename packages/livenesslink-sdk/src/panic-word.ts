/**
 * Panic Word Detection Module
 * Emergency scenario detection for user safety
 *
 * @package @livenesslink/sdk
 * @version 1.0.0
 */

/// <reference path="./speech-api.d.ts" />

export interface PanicDetectorConfig {
  /** Custom panic words to detect (added to defaults) */
  customPanicWords?: string[];
  /** Replace default panic words entirely */
  replaceDefaults?: boolean;
  /** Sensitivity level: 'low' | 'medium' | 'high' */
  sensitivity?: "low" | "medium" | "high";
  /** Language for speech recognition */
  language?: string;
  /** Enable continuous listening */
  continuous?: boolean;
}

export interface PanicEvent {
  detectedWord: string;
  confidence: number;
  timestamp: Date;
  transcript: string;
}

export type PanicCallback = (event: PanicEvent) => void;

/**
 * PanicWordDetector
 * Uses Web Speech API for real-time panic word detection
 */
export class PanicWordDetector {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private panicCallbacks: Set<PanicCallback> = new Set();

  // Default panic words (lowercase)
  private defaultPanicWords: Set<string> = new Set([
    "help",
    "emergency",
    "help me",
    "call police",
    "help me please",
    "emergency please",
    "call help",
    "save me",
    "urgent",
    "danger",
  ]);

  private panicWords: Set<string>;
  private sensitivity: "low" | "medium" | "high";
  private language: string;

  // Browser compatibility
  private static isSupported: boolean =
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  constructor(config: PanicDetectorConfig = {}) {
    this.sensitivity = config.sensitivity || "high";
    this.language = config.language || "en-US";

    // Build panic words set
    if (config.replaceDefaults) {
      this.panicWords = new Set(config.customPanicWords || []);
    } else {
      this.panicWords = new Set(this.defaultPanicWords);
      if (config.customPanicWords) {
        config.customPanicWords.forEach(word =>
          this.panicWords.add(word.toLowerCase())
        );
      }
    }

    // Initialize speech recognition
    this.initRecognition();
  }

  /**
   * Initialize Speech Recognition API
   */
  private initRecognition(): void {
    if (!PanicWordDetector.isSupported) {
      console.warn(
        "[PanicDetector] Web Speech API not supported in this browser. Panic detection disabled."
      );
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();

    this.recognition!.continuous = true;
    this.recognition!.interimResults = true;
    this.recognition!.lang = this.language;

    this.recognition!.onresult = (event: SpeechRecognitionEvent) => {
      this.handleSpeechResult(event);
    };

    this.recognition!.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[PanicDetector] Speech recognition error:", event.error);
      // Attempt restart on recoverable errors
      if (event.error === "no-speech" || event.error === "audio-capture") {
        if (this.isListening) {
          setTimeout(() => this.restart(), 1000);
        }
      }
    };

    this.recognition!.onend = () => {
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        this.restart();
      }
    };
  }

  /**
   * Handle speech recognition results
   */
  private handleSpeechResult(event: SpeechRecognitionEvent): void {
    const results = event.results;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const transcript = result[0].transcript.toLowerCase().trim();
      const confidence = result[0].confidence;

      if (result.isFinal) {
        // Check if any panic word is in the transcript
        for (const panicWord of this.panicWords) {
          if (this.containsPanicWord(transcript, panicWord)) {
            const panicEvent: PanicEvent = {
              detectedWord: panicWord,
              confidence: confidence,
              timestamp: new Date(),
              transcript: result[0].transcript,
            };

            // Trigger all registered callbacks
            this.panicCallbacks.forEach(callback => {
              try {
                callback(panicEvent);
              } catch (error) {
                console.error("[PanicDetector] Callback error:", error);
              }
            });

            // Break after first match to avoid duplicate triggers
            return;
          }
        }
      }
    }
  }

  /**
   * Check if transcript contains panic word
   * Uses sensitivity-based matching
   */
  private containsPanicWord(transcript: string, panicWord: string): boolean {
    // Exact match (highest confidence)
    if (transcript.includes(panicWord)) {
      return true;
    }

    // Fuzzy matching for high sensitivity
    if (this.sensitivity === "high") {
      // Check for partial matches (e.g., "helping" contains "help")
      const words = transcript.split(/\s+/);
      for (const word of words) {
        if (this.fuzzyMatch(word, panicWord)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Simple fuzzy matching for similar words
   */
  private fuzzyMatch(word: string, target: string): boolean {
    // Check if word starts with the target (e.g., "helping" starts with "help")
    if (word.startsWith(target) && word.length > target.length) {
      return true;
    }

    // Check if word contains target as substring
    if (word.includes(target) && target.length >= 4) {
      return true;
    }

    return false;
  }

  /**
   * Restart recognition after interruption
   */
  private restart(): void {
    try {
      if (this.recognition && this.isListening) {
        this.recognition.start();
      }
    } catch (error) {
      console.error("[PanicDetector] Failed to restart:", error);
    }
  }

  /**
   * Start listening for panic words
   * @returns Promise that resolves when listening starts
   */
  startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!PanicWordDetector.isSupported) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      if (this.isListening) {
        resolve();
        return;
      }

      try {
        if (this.recognition) {
          this.recognition.start();
          this.isListening = true;
          console.log("[PanicDetector] Started listening for panic words");
          resolve();
        } else {
          reject(new Error("Speech recognition not initialized"));
        }
      } catch (error) {
        console.error("[PanicDetector] Failed to start:", error);
        reject(error);
      }
    });
  }

  /**
   * Stop listening for panic words
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        console.log("[PanicDetector] Stopped listening");
      } catch (error) {
        console.error("[PanicDetector] Error stopping:", error);
      }
    }
  }

  /**
   * Register callback for panic word detection
   * @param callback Function to call when panic word detected
   * @returns Unsubscribe function
   */
  onPanicDetected(callback: PanicCallback): () => void {
    this.panicCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.panicCallbacks.delete(callback);
    };
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Update panic words dynamically
   */
  setPanicWords(words: string[]): void {
    this.panicWords = new Set(words.map(w => w.toLowerCase()));
  }

  /**
   * Add additional panic words
   */
  addPanicWords(words: string[]): void {
    words.forEach(word => this.panicWords.add(word.toLowerCase()));
  }

  /**
   * Check if browser supports panic detection
   */
  static checkSupport(): boolean {
    return PanicWordDetector.isSupported;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopListening();
    this.panicCallbacks.clear();
  }
}

// Default instance for convenience
export const createPanicDetector = (
  config?: PanicDetectorConfig
): PanicWordDetector => {
  return new PanicWordDetector(config);
};

export default PanicWordDetector;
