package services

import (
	"fmt"
	"time"

	"github.com/rs/zerolog"
)

// SelfHealingAuditService handles the recording of critical system errors and recovery events
type SelfHealingAuditService struct {
	logger *zerolog.Logger
	proxy  *ProxyService
}

func NewSelfHealingAuditService(logger *zerolog.Logger, proxy *ProxyService) *SelfHealingAuditService {
	return &SelfHealingAuditService{
		logger: logger,
		proxy:  proxy,
	}
}

// RecordPanic logs a system panic to the self-healing audit system
func (s *SelfHealingAuditService) RecordPanic(recovery interface{}, stack []byte) {
	msg := fmt.Sprintf("CRITICAL PANIC RECOVERED: %v", recovery)
	s.logger.Error().
		RawJSON("stack", stack).
		Interface("recovery", recovery).
		Msg(msg)

	// Bridging to Python Self-Healing system
	go func() {
		event := map[string]interface{}{
			"type":      "system_panic",
			"severity":  "fatal",
			"message":   msg,
			"timestamp": time.Now().Format(time.RFC3339),
			"metadata": map[string]interface{}{
				"recovery": fmt.Sprintf("%v", recovery),
				"stack":    string(stack),
			},
		}

		_, err := s.proxy.Forward(nil, "POST", "/self-healing/events", event)
		if err != nil {
			s.logger.Warn().Err(err).Msg("Failed to bridge panic event to self-healing backend")
		}
	}()
}

// RecordServiceDegradation logs when a service enters sandbox or degraded mode
func (s *SelfHealingAuditService) RecordServiceDegradation(serviceName string, reason string) {
	s.logger.Warn().
		Str("service", serviceName).
		Str("reason", reason).
		Msg("Service entered degradation state (Sandbox Mode)")

	go func() {
		event := map[string]interface{}{
			"type":      "service_degradation",
			"severity":  "high",
			"message":   fmt.Sprintf("%s entered sandbox mode: %s", serviceName, reason),
			"timestamp": time.Now().Format(time.RFC3339),
		}
		_, _ = s.proxy.Forward(nil, "POST", "/self-healing/events", event)
	}()
}
