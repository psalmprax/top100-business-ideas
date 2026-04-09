package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/middleware"
)

type PanicHandler struct {
	adminSecret string
}

func NewPanicHandler(adminSecret string) *PanicHandler {
	return &PanicHandler{
		adminSecret: adminSecret,
	}
}

func (h *PanicHandler) Lock(c *gin.Context) {
	middleware.SetLock(true)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Global System Lock engaged. All agentic operations suspended.",
	})
}

func (h *PanicHandler) Reset(c *gin.Context) {
	var input struct {
		AdminSecret string `json:"adminSecret"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if input.AdminSecret != h.adminSecret {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized reset attempt"})
		return
	}

	middleware.SetLock(false)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Global System Lock released by administrator.",
	})
}
