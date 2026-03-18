package handlers

import (
	"github.com/top100-business-ideas/api/internal/services"

	"github.com/gin-gonic/gin"
)

type WebSocketHandler struct {
	hub *services.WebSocketHub
}

func NewWebSocketHandler(hub *services.WebSocketHub) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
	}
}

func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	services.ServeWs(h.hub, c.Writer, c.Request)
}
