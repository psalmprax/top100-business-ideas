package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCORS(t *testing.T) {
	gin.SetMode(gin.TestMode)
	allowedOrigins := []string{"http://localhost:3000", "https://app.alpha-ai.io"}

	t.Run("Allowed Origin", func(t *testing.T) {
		r := gin.New()
		r.Use(CORS(allowedOrigins))
		r.GET("/test", func(c *gin.Context) {
			c.Status(http.StatusOK)
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		req.Header.Set("Origin", "http://localhost:3000")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "http://localhost:3000", w.Header().Get("Access-Control-Allow-Origin"))
		assert.Equal(t, "true", w.Header().Get("Access-Control-Allow-Credentials"))
	})

	t.Run("Disallowed Origin", func(t *testing.T) {
		r := gin.New()
		r.Use(CORS(allowedOrigins))
		r.GET("/test", func(c *gin.Context) {
			c.Status(http.StatusOK)
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		req.Header.Set("Origin", "http://malicious-site.com")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Empty(t, w.Header().Get("Access-Control-Allow-Origin"))
	})

	t.Run("Preflight Request", func(t *testing.T) {
		r := gin.New()
		r.Use(CORS(allowedOrigins))

		req, _ := http.NewRequest("OPTIONS", "/test", nil)
		req.Header.Set("Origin", "http://localhost:3000")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)
		assert.Equal(t, "http://localhost:3000", w.Header().Get("Access-Control-Allow-Origin"))
	})
}

func TestRequestID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Generates New ID", func(t *testing.T) {
		r := gin.New()
		r.Use(RequestID())
		r.GET("/test", func(c *gin.Context) {
			val, _ := c.Get("RequestID")
			c.String(http.StatusOK, val.(string))
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.NotEmpty(t, w.Header().Get("X-Request-ID"))
		assert.Equal(t, w.Header().Get("X-Request-ID"), w.Body.String())
	})

	t.Run("Preserves Existing ID", func(t *testing.T) {
		r := gin.New()
		r.Use(RequestID())
		r.GET("/test", func(c *gin.Context) {
			c.Status(http.StatusOK)
		})

		existingID := "test-id-123"
		req, _ := http.NewRequest("GET", "/test", nil)
		req.Header.Set("X-Request-ID", existingID)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, existingID, w.Header().Get("X-Request-ID"))
	})
}
