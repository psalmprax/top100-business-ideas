package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/top100-business-ideas/api/internal/services"
)

type BillingHandler struct {
	service *services.BillingService
	proxy   *services.ProxyService
}

func NewBillingHandler(s *services.BillingService, p *services.ProxyService) *BillingHandler {
	return &BillingHandler{
		service: s,
		proxy:   p,
	}
}

func (h *BillingHandler) GetSubscription(c *gin.Context) {
	// Real-First logic: Proxy to Python Enterprise API
	resp, err := h.proxy.Forward("GET", "/enterprise/subscription", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscription", "details": err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
}

func (h *BillingHandler) GetInvoices(c *gin.Context) {
	// Real-First logic: Proxy to Python Enterprise API
	resp, err := h.proxy.Forward("GET", "/enterprise/invoices", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch invoices", "details": err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/json", resp)
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
