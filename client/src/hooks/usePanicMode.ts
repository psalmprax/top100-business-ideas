/**
 * usePanicMode Hook
 * Emergency response integration for panic word detection
 *
 * Provides panic mode state management and emergency response triggers
 * when panic words are detected via the LivenessLink SDK
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PanicWordDetector,
  PanicEvent,
  PanicDetectorConfig,
} from "@livenesslink/sdk";

export interface PanicModeState {
  isPanicMode: boolean;
  lastPanicEvent: PanicEvent | null;
  isListening: boolean;
  isSupported: boolean;
}

export interface UsePanicModeReturn extends PanicModeState {
  activatePanicMode: (event?: PanicEvent) => void;
  deactivatePanicMode: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearPanicHistory: () => void;
}

/**
 * Custom hook for panic mode detection and emergency response
 *
 * @param config Optional configuration for panic word detector
 * @param onPanicDetected Optional callback when panic word detected
 * @param autoActivate Whether to automatically activate panic mode on detection (default: true)
 */
export function usePanicMode(
  config?: PanicDetectorConfig,
  onPanicDetected?: (event: PanicEvent) => void,
  autoActivate: boolean = true
): UsePanicModeReturn {
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [lastPanicEvent, setLastPanicEvent] = useState<PanicEvent | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const detectorRef = useRef<PanicWordDetector | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize detector on mount
  useEffect(() => {
    // Check if browser supports speech recognition
    const supported = PanicWordDetector.checkSupport();
    setIsSupported(supported);

    if (supported) {
      detectorRef.current = new PanicWordDetector(config);

      // Set up callback for panic detection
      unsubscribeRef.current = detectorRef.current.onPanicDetected((event: PanicEvent) => {
        console.log("[usePanicMode] Panic word detected:", event.detectedWord);

        // Store the event
        setLastPanicEvent(event);

        // Call external callback if provided
        if (onPanicDetected) {
          onPanicDetected(event);
        }

        // Auto-activate panic mode if enabled
        if (autoActivate) {
          activatePanicModeInternal(event);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (detectorRef.current) {
        detectorRef.current.stopListening();
        detectorRef.current.dispose();
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []); // Run once on mount

  /**
   * Internal function to activate panic mode
   * Handles session cleanup, data clearing, and navigation
   */
  const activatePanicModeInternal = useCallback(async (event: PanicEvent) => {
    console.log("[usePanicMode] Activating panic mode...");

    // 1. Clear sensitive data from localStorage
    const sensitiveKeys = ["auth_token", "demo_mode", "user_session"];
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // 2. Clear session storage
    sessionStorage.clear();

    // 3. Log the panic event for audit (non-sensitive logging only)
    console.warn("[PANIC-AUDIT]", {
      timestamp: event.timestamp.toISOString(),
      detectedWord: event.detectedWord,
      confidence: event.confidence,
    });

    // 4. Set panic mode state (triggers UI response)
    setIsPanicMode(true);

    // 5. Stop listening to prevent duplicate triggers
    if (detectorRef.current) {
      detectorRef.current.stopListening();
      setIsListening(false);
    }

    // Note: Navigation to safe screen would be handled by the component
    // using this hook (via onPanicDetected callback or isPanicMode state)
  }, []);

  /**
   * Public activation function - can be called manually
   */
  const activatePanicMode = useCallback(
    (event?: PanicEvent) => {
      const panicEvent = event ||
        lastPanicEvent || {
          detectedWord: "manual",
          confidence: 1.0,
          timestamp: new Date(),
          transcript: "Manual panic activation",
        };
      activatePanicModeInternal(panicEvent);
    },
    [lastPanicEvent, activatePanicModeInternal]
  );

  /**
   * Deactivate panic mode
   * Note: In production, this should require re-authentication
   */
  const deactivatePanicMode = useCallback(() => {
    console.log("[usePanicMode] Deactivating panic mode");
    setIsPanicMode(false);

    // Optionally restart listening if it was active
    // This would be controlled by the component
  }, []);

  /**
   * Start listening for panic words
   */
  const startListening = useCallback(async () => {
    if (detectorRef.current && isSupported) {
      try {
        await detectorRef.current.startListening();
        setIsListening(true);
        console.log("[usePanicMode] Started listening");
      } catch (error) {
        console.error("[usePanicMode] Failed to start listening:", error);
        throw error;
      }
    } else if (!isSupported) {
      console.warn(
        "[usePanicMode] Panic detection not supported in this browser"
      );
    }
  }, [isSupported]);

  /**
   * Stop listening for panic words
   */
  const stopListening = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.stopListening();
      setIsListening(false);
      console.log("[usePanicMode] Stopped listening");
    }
  }, []);

  /**
   * Clear panic history
   */
  const clearPanicHistory = useCallback(() => {
    setLastPanicEvent(null);
  }, []);

  return {
    isPanicMode,
    lastPanicEvent,
    isListening,
    isSupported,
    activatePanicMode,
    deactivatePanicMode,
    startListening,
    stopListening,
    clearPanicHistory,
  };
}

export default usePanicMode;
