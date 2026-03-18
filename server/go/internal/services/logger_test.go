package services

import (
	"bytes"
	"strings"
	"testing"
	"time"
)

func TestLogger(t *testing.T) {
	// Create a buffer to capture log output
	buf := &bytes.Buffer{}
	logger := NewLogger(buf, INFO)

	// Test Info logging
	logger.Info("Test message", "key", "value")
	output := buf.String()
	if !strings.Contains(output, "Test message") {
		t.Error("Expected log message not found")
	}
	if !strings.Contains(output, "INFO") {
		t.Error("Expected INFO level not found")
	}
}

func TestLoggerLevels(t *testing.T) {
	buf := &bytes.Buffer{}
	logger := NewLogger(buf, WARN)

	// Debug should not be logged
	logger.Debug("Debug message")
	if buf.Len() != 0 {
		t.Error("Debug message should not be logged when level is WARN")
	}

	// Warn should be logged
	buf.Reset()
	logger.Warn("Warning message")
	if !strings.Contains(buf.String(), "Warning message") {
		t.Error("Warning message should be logged")
	}
}

func TestLoggerWithFields(t *testing.T) {
	buf := &bytes.Buffer{}
	logger := NewLogger(buf, INFO)

	logger.WithFields(map[string]interface{}{
		"user_id": "123",
		"action":  "login",
	}).Info("User logged in")

	output := buf.String()
	if !strings.Contains(output, "user_id") {
		t.Error("Expected custom field not found in log")
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		email    string
		expected bool
	}{
		{"test@example.com", true},
		{"user@domain.org", true},
		{"user.name@company.co.uk", true},
		{"invalid", false},
		{"invalid@", false},
		{"@domain.com", false},
		{"", false},
		{"user@domain.com ", false},
	}

	for _, tt := range tests {
		result := ValidateEmail(tt.email)
		if result != tt.expected {
			t.Errorf("ValidateEmail(%q) = %v, want %v", tt.email, result, tt.expected)
		}
	}
}

func TestRequestLogger(t *testing.T) {
	buf := &bytes.Buffer{}
	logger := NewLogger(buf, INFO)

	reqLogger := logger.WithRequest("req-123", "POST", "/api/users")
	reqLogger.LogRequest(200, 50*time.Millisecond)

	output := buf.String()
	if !strings.Contains(output, "req-123") {
		t.Error("Expected request ID not found")
	}
	if !strings.Contains(output, "POST") {
		t.Error("Expected method not found")
	}
	if !strings.Contains(output, "200") {
		t.Error("Expected status code not found")
	}
}

func TestEmailValidation(t *testing.T) {
	// Email service uses ValidateEmail function
	_ = NewEmailService()

	tests := []struct {
		email string
		valid bool
	}{
		{"test@example.com", true},
		{"invalid", false},
		{"", false},
		{"@example.com", false},
	}

	for _, tt := range tests {
		result := ValidateEmail(tt.email)
		if result != tt.valid {
			t.Errorf("ValidateEmail(%q) = %v, expected %v", tt.email, result, tt.valid)
		}
	}
}

func BenchmarkLoggerInfo(b *testing.B) {
	buf := &bytes.Buffer{}
	logger := NewLogger(buf, INFO)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		logger.Info("Benchmark message", "iteration", i)
	}
}

func BenchmarkLoggerWithFields(b *testing.B) {
	buf := &bytes.Buffer{}
	logger := NewLogger(buf, INFO)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		logger.WithFields(map[string]interface{}{
			"iteration": i,
			"timestamp": time.Now().Unix(),
		}).Info("Benchmark with fields")
	}
}
