package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/services"
)

type BillingHandler struct {
	service *services.BillingService
}

func NewBillingHandler(s *services.BillingService) *BillingHandler {
	return &BillingHandler{
		service: s,
	}
}

func (h *BillingHandler) GetSubscription(c *gin.Context) {
	// In production, fetch from Stripe or your DB
	subscription := gin.H{
		"id":                   "sub_123456",
		"plan":                 "professional",
		"status":               "active",
		"current_period_end":   time.Now().Add(30 * 24 * time.Hour).Format(time.RFC3339),
		"cancel_at_period_end": false,
	}
	c.JSON(http.StatusOK, subscription)
}

func (h *BillingHandler) GetInvoices(c *gin.Context) {
	// In production, fetch from Stripe
	invoices := []gin.H{
		{
			"id":      "INV-2024-004",
			"amount":  1499.00,
			"status":  "paid",
			"date":    time.Now().Add(-7 * 24 * time.Hour).Format("2006-01-02"),
			"pdf_url": "#",
		},
	}
	c.JSON(http.StatusOK, invoices)
}

func (h *BillingHandler) CreateCheckout(c *gin.Context) {
	var req struct {
		PlanID   string `json:"plan_id"`
		Provider string `json:"provider"` // "stripe" or "paypal"
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	successURL := "http://localhost:5173/billing?success=true"
	cancelURL := "http://localhost:5173/billing?canceled=true"

	var checkoutURL string
	var err error

	if req.Provider == "paypal" {
		checkoutURL, err = h.service.CreatePayPalOrder(req.PlanID)
	} else {
		// Default to stripe
		checkoutURL, err = h.service.CreateStripeCheckoutSession(req.PlanID, successURL, cancelURL)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create checkout: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url": checkoutURL,
	})
}

func (h *BillingHandler) CancelSubscription(c *gin.Context) {
	// Add Stripe cancellation logic here
	c.JSON(http.StatusOK, gin.H{
		"message": "Subscription cancellation initiated via Stripe portal",
	})
}

func (h *BillingHandler) UpdatePaymentMethod(c *gin.Context) {
	// Add Stripe portal redirection or update logic here
	c.JSON(http.StatusOK, gin.H{
		"message": "Redirecting to Stripe Customer Portal...",
	})
}
