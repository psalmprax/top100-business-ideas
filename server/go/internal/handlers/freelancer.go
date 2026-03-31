package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/repository"
)

type FreelancerHandler struct {
	repo *repository.FreelancerRepository
}

func NewFreelancerHandler(repo *repository.FreelancerRepository) *FreelancerHandler {
	return &FreelancerHandler{repo: repo}
}

// Tasks
func (h *FreelancerHandler) ListTasks(c *gin.Context) {
	userID := c.GetString("user_id") // Derived from Auth middleware
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000000" // Fallback for demo
	}

	tasks, err := h.repo.ListTasks(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to list tasks", Details: err.Error()})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

func (h *FreelancerHandler) CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request", Details: err.Error()})
		return
	}

	task.UserID = c.GetString("user_id")
	if task.UserID == "" {
		task.UserID = "00000000-0000-0000-0000-000000000000"
	}

	if err := h.repo.CreateTask(c.Request.Context(), &task); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create task", Details: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, task)
}

// Clients
func (h *FreelancerHandler) ListClients(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000000"
	}

	clients, err := h.repo.ListClients(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to list clients"})
		return
	}
	c.JSON(http.StatusOK, clients)
}

func (h *FreelancerHandler) CreateClient(c *gin.Context) {
	var client models.Client
	if err := c.ShouldBindJSON(&client); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	client.UserID = c.GetString("user_id")
	if client.UserID == "" {
		client.UserID = "00000000-0000-0000-0000-000000000000"
	}

	if err := h.repo.CreateClient(c.Request.Context(), &client); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create client"})
		return
	}
	c.JSON(http.StatusCreated, client)
}

// Events
func (h *FreelancerHandler) ListEvents(c *gin.Context) {
	userID := c.GetString("user_id")
	events, err := h.repo.ListEvents(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to list events"})
		return
	}
	c.JSON(http.StatusOK, events)
}

func (h *FreelancerHandler) CreateEvent(c *gin.Context) {
	var event models.CalendarEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	event.UserID = c.GetString("user_id")
	if err := h.repo.CreateEvent(c.Request.Context(), &event); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create event"})
		return
	}
	c.JSON(http.StatusCreated, event)
}

// Notes
func (h *FreelancerHandler) ListNotes(c *gin.Context) {
	userID := c.GetString("user_id")
	notes, err := h.repo.ListNotes(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to list notes"})
		return
	}
	c.JSON(http.StatusOK, notes)
}

func (h *FreelancerHandler) CreateNote(c *gin.Context) {
	var note models.AuditNote
	if err := c.ShouldBindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	note.UserID = c.GetString("user_id")
	if err := h.repo.CreateNote(c.Request.Context(), &note); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create note"})
		return
	}
	c.JSON(http.StatusCreated, note)
}
