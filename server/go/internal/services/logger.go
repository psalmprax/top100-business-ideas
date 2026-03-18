package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"time"
)

// LogLevel represents the severity of a log message
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
	FATAL
)

// String returns the string representation of LogLevel
func (l LogLevel) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	case FATAL:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

// LogEntry represents a structured log entry
type LogEntry struct {
	Timestamp string                 `json:"timestamp"`
	Level     string                 `json:"level"`
	Message   string                 `json:"message"`
	Fields    map[string]interface{} `json:"fields,omitempty"`
	Caller    string                 `json:"caller,omitempty"`
}

// Logger provides structured logging
type Logger struct {
	mu          sync.Mutex
	output      io.Writer
	level       LogLevel
	prettyPrint bool
	timeFormat  string
}

// DefaultLogger is the default logger instance
var DefaultLogger *Logger

func init() {
	// Initialize default logger
	DefaultLogger = NewLogger(os.Stdout, INFO)
}

// NewLogger creates a new logger
func NewLogger(output io.Writer, level LogLevel) *Logger {
	return &Logger{
		output:      output,
		level:       level,
		prettyPrint: true,
		timeFormat:  "2006-01-02T15:04:05.000Z07:00",
	}
}

// NewFileLogger creates a logger that writes to a file
func NewFileLogger(filename string, level LogLevel) (*Logger, error) {
	// Ensure directory exists
	dir := filepath.Dir(filename)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create log directory: %w", err)
	}

	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to open log file: %w", err)
	}

	return &Logger{
		output:      file,
		level:       level,
		prettyPrint: false,
		timeFormat:  "2006-01-02T15:04:05.000Z07:00",
	}, nil
}

// SetLevel sets the minimum log level
func (l *Logger) SetLevel(level LogLevel) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.level = level
}

// log writes a log entry
func (l *Logger) log(level LogLevel, message string, fields map[string]interface{}) {
	if level < l.level {
		return
	}

	l.mu.Lock()
	defer l.mu.Unlock()

	// Get caller info
	_, file, line, ok := runtime.Caller(2)
	caller := ""
	if ok {
		caller = fmt.Sprintf("%s:%d", filepath.Base(file), line)
	}

	entry := LogEntry{
		Timestamp: time.Now().Format(l.timeFormat),
		Level:     level.String(),
		Message:   message,
		Fields:    fields,
		Caller:    caller,
	}

	// Write log entry
	if l.prettyPrint {
		if entry.Fields != nil {
			fieldsJSON, _ := json.Marshal(entry.Fields)
			fmt.Fprintf(l.output, "[%s] %s: %s (caller: %s) %s\n",
				entry.Timestamp, entry.Level, entry.Message, entry.Caller, string(fieldsJSON))
		} else {
			fmt.Fprintf(l.output, "[%s] %s: %s (caller: %s)\n",
				entry.Timestamp, entry.Level, entry.Message, entry.Caller)
		}
	} else {
		data, err := json.Marshal(entry)
		if err == nil {
			l.output.Write(append(data, '\n'))
		}
	}

	// Exit for fatal
	if level == FATAL {
		os.Exit(1)
	}
}

// Debug logs a debug message
func (l *Logger) Debug(message string, fields ...interface{}) {
	l.log(DEBUG, message, keyValuesToMap(fields...))
}

// Info logs an info message
func (l *Logger) Info(message string, fields ...interface{}) {
	l.log(INFO, message, keyValuesToMap(fields...))
}

// Warn logs a warning message
func (l *Logger) Warn(message string, fields ...interface{}) {
	l.log(WARN, message, keyValuesToMap(fields...))
}

// Error logs an error message
func (l *Logger) Error(message string, fields ...interface{}) {
	l.log(ERROR, message, keyValuesToMap(fields...))
}

// Fatal logs a fatal message and exits
func (l *Logger) Fatal(message string, fields ...interface{}) {
	l.log(FATAL, message, keyValuesToMap(fields...))
}

// WithFields adds fields to subsequent log calls
func (l *Logger) WithFields(fields map[string]interface{}) *LoggerEntry {
	return &LoggerEntry{logger: l, fields: fields}
}

// LoggerEntry is a logger with pre-attached fields
type LoggerEntry struct {
	logger *Logger
	fields map[string]interface{}
}

// Debug logs a debug message with pre-attached fields
func (e *LoggerEntry) Debug(message string) {
	e.logger.log(DEBUG, message, e.fields)
}

// Info logs an info message with pre-attached fields
func (e *LoggerEntry) Info(message string) {
	e.logger.log(INFO, message, e.fields)
}

// Warn logs a warning message with pre-attached fields
func (e *LoggerEntry) Warn(message string) {
	e.logger.log(WARN, message, e.fields)
}

// Error logs an error message with pre-attached fields
func (e *LoggerEntry) Error(message string) {
	e.logger.log(ERROR, message, e.fields)
}

// Fatal logs a fatal message with pre-attached fields
func (e *LoggerEntry) Fatal(message string) {
	e.logger.log(FATAL, message, e.fields)
}

// keyValuesToMap converts key-value pairs to a map
func keyValuesToMap(fields ...interface{}) map[string]interface{} {
	if len(fields) == 0 {
		return nil
	}
	if len(fields)%2 != 0 {
		log.Printf("Warning: odd number of fields provided, last field will be ignored")
		fields = fields[:len(fields)-1]
	}

	result := make(map[string]interface{}, len(fields)/2)
	for i := 0; i < len(fields); i += 2 {
		key, ok := fields[i].(string)
		if !ok {
			continue
		}
		result[key] = fields[i+1]
	}
	return result
}

// Convenience functions using DefaultLogger

// Debug logs a debug message
func Debug(message string, fields ...interface{}) {
	DefaultLogger.Debug(message, fields...)
}

// Info logs an info message
func Info(message string, fields ...interface{}) {
	DefaultLogger.Info(message, fields...)
}

// Warn logs a warning message
func Warn(message string, fields ...interface{}) {
	DefaultLogger.Warn(message, fields...)
}

// Error logs an error message
func Error(message string, fields ...interface{}) {
	DefaultLogger.Error(message, fields...)
}

// Fatal logs a fatal message and exits
func Fatal(message string, fields ...interface{}) {
	DefaultLogger.Fatal(message, fields...)
}

// WithFields adds fields to subsequent log calls
func WithFields(fields map[string]interface{}) *LoggerEntry {
	return DefaultLogger.WithFields(fields)
}

// RequestLogger creates a logger with request context
type RequestLogger struct {
	logger    *Logger
	requestID string
	method    string
	path      string
}

// WithRequest creates a logger with request context
func (l *Logger) WithRequest(requestID, method, path string) *RequestLogger {
	return &RequestLogger{
		logger:    l,
		requestID: requestID,
		method:    method,
		path:      path,
	}
}

// LogRequest logs an HTTP request
func (rl *RequestLogger) LogRequest(statusCode int, duration time.Duration) {
	rl.logger.Info("HTTP Request",
		"request_id", rl.requestID,
		"method", rl.method,
		"path", rl.path,
		"status", statusCode,
		"duration_ms", duration.Milliseconds(),
	)
}

// Error logs an error with request context
func (rl *RequestLogger) Error(message string, fields ...interface{}) {
	fieldsMap := map[string]interface{}{
		"request_id": rl.requestID,
		"method":     rl.method,
		"path":       rl.path,
	}
	for i := 0; i < len(fields); i += 2 {
		if i+1 < len(fields) {
			fieldsMap[fmt.Sprintf("%v", fields[i])] = fields[i+1]
		}
	}
	rl.logger.log(ERROR, message, fieldsMap)
}
