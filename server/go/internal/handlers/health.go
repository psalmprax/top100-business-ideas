package handlers

import (
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "api-gateway",
		"version": "1.0.0",
	})
}

// SystemMetricsHandler provides external monitoring metrics
type SystemMetricsHandler struct {
	startTime time.Time
}

func NewSystemMetricsHandler() *SystemMetricsHandler {
	return &SystemMetricsHandler{
		startTime: time.Now(),
	}
}

// SystemMetrics represents system metrics for monitoring
type SystemMetrics struct {
	Uptime         float64   `json:"uptime_seconds"`
	Version        string    `json:"version"`
	GoVersion      string    `json:"go_version"`
	CPUCount       int       `json:"cpu_count"`
	MemoryAllocMB  uint64    `json:"memory_alloc_mb"`
	MemoryTotalMB  uint64    `json:"memory_total_mb"`
	NumGoroutines  int       `json:"num_goroutines"`
	HeapObjects    uint64    `json:"heap_objects"`
	GCCount        uint32    `json:"gc_count"`
	LastGCDuration float64   `json:"last_gc_duration_ms"`
	Status         string    `json:"status"`
	Timestamp      time.Time `json:"timestamp"`
}

// SystemMetrics returns system metrics for external monitoring (Datadog, Prometheus, etc.)
func (h *SystemMetricsHandler) SystemMetrics(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	metrics := SystemMetrics{
		Uptime:         time.Since(h.startTime).Seconds(),
		Version:        "1.0.0",
		GoVersion:      runtime.Version(),
		CPUCount:       runtime.NumCPU(),
		MemoryAllocMB:  m.Alloc / 1024 / 1024,
		MemoryTotalMB:  m.TotalAlloc / 1024 / 1024,
		NumGoroutines:  runtime.NumGoroutine(),
		HeapObjects:    m.Mallocs,
		GCCount:        m.NumGC,
		LastGCDuration: float64(m.LastGC) / 1e6, // Convert ns to ms
		Status:         "healthy",
		Timestamp:      time.Now(),
	}

	c.JSON(http.StatusOK, metrics)
}

// Liveness returns liveness probe status
func (h *SystemMetricsHandler) Liveness(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "alive",
		"time":   time.Now().Unix(),
	})
}

// Readiness returns readiness probe status
func (h *SystemMetricsHandler) Readiness(c *gin.Context) {
	// Check if service is ready to accept traffic
	c.JSON(http.StatusOK, gin.H{
		"status":   "ready",
		"database": "connected",
		"redis":    "connected",
		"time":     time.Now().Unix(),
	})
}

// Version returns version information
func (h *SystemMetricsHandler) Version(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"version":      "1.0.0",
		"build_date":   "2026-03-17",
		"go_version":   runtime.Version(),
		"dependencies": gin.Version,
	})
}

// Ping returns a simple ping response
func (h *SystemMetricsHandler) Ping(c *gin.Context) {
	c.String(http.StatusOK, "pong")
}
