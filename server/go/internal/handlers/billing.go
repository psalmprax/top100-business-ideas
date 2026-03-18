package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type BillingHandler struct{}

func NewBillingHandler() *BillingHandler {
	return &BillingHandler{}
}

func (h *BillingHandler) GetSubscription(c *gin.Context) {
	subscription := gin.H{
		"id":                   "sub_123456",
		"plan":                 "growth",
		"status":               "active",
		"current_period_end":   time.Now().Add(30 * 24 * time.Hour).Format(time.RFC3339),
		"cancel_at_period_end": false,
	}
	c.JSON(http.StatusOK, subscription)
}

func (h *BillingHandler) GetInvoices(c *gin.Context) {
	invoices := []gin.H{
		{
			"id":      "INV-2024-001",
			"amount":  49.00,
			"status":  "paid",
			"date":    "2024-01-01",
			"pdf_url": "/invoices/INV-2024-001.pdf",
		},
		{
			"id":      "INV-2024-002",
			"amount":  49.00,
			"status":  "paid",
			"date":    "2024-02-01",
			"pdf_url": "/invoices/INV-2024-002.pdf",
		},
		{
			"id":      "INV-2024-003",
			"amount":  49.00,
			"status":  "paid",
			"date":    "2024-03-01",
			"pdf_url": "/invoices/INV-2024-003.pdf",
		},
	}
	c.JSON(http.StatusOK, invoices)
}

func (h *BillingHandler) CreateCheckout(c *gin.Context) {
	var req struct {
		PlanID string `json:"plan_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// In production, create Stripe checkout session
	checkoutURL := "https://checkout.stripe.com/pay/cs_test_xxx"

	c.JSON(http.StatusOK, gin.H{
		"url": checkoutURL,
	})
}

func (h *BillingHandler) CancelSubscription(c *gin.Context) {
	subscription := gin.H{
		"id":                   "sub_123456",
		"plan":                 "growth",
		"status":               "active",
		"current_period_end":   time.Now().Add(30 * 24 * time.Hour).Format(time.RFC3339),
		"cancel_at_period_end": true,
	}
	c.JSON(http.StatusOK, subscription)
}

func (h *BillingHandler) UpdatePaymentMethod(c *gin.Context) {
	var req struct {
		PaymentMethodID string `json:"payment_method_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment method updated",
	})
}
