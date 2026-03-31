package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/models"
	"github.com/top100-business-ideas/api/internal/repository"
)

type DenialDefenseHandler struct {
	repo *repository.DenialDefenseRepository
}

func NewDenialDefenseHandler(repo *repository.DenialDefenseRepository) *DenialDefenseHandler {
	return &DenialDefenseHandler{repo: repo}
}

func (h *DenialDefenseHandler) ListClaims(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000000"
	}

	claims, err := h.repo.ListClaims(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to list claims", Details: err.Error()})
		return
	}
	c.JSON(http.StatusOK, claims)
}

func (h *DenialDefenseHandler) CreateClaim(c *gin.Context) {
	var claim models.Claim
	if err := c.ShouldBindJSON(&claim); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}

	claim.UserID = c.GetString("user_id")
	if claim.UserID == "" {
		claim.UserID = "00000000-0000-0000-0000-000000000000"
	}

	if err := h.repo.CreateClaim(c.Request.Context(), &claim); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create claim"})
		return
	}
	c.JSON(http.StatusCreated, claim)
}

func (h *DenialDefenseHandler) UpdateClaim(c *gin.Context) {
	var claim models.Claim
	if err := c.ShouldBindJSON(&claim); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request"})
		return
	}
	claim.UserID = c.GetString("user_id")
	if claim.UserID == "" {
		claim.UserID = "00000000-0000-0000-0000-000000000000"
	}

	if err := h.repo.UpdateClaim(c.Request.Context(), &claim); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update claim"})
		return
	}
	c.JSON(http.StatusOK, claim)
}
