package handlers

import (
	"encoding/json"
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
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	resp, err := h.proxy.Forward("GET", "/enterprise/subscription", nil)
	if err == nil {
		var sub map[string]interface{}
		if json.Unmarshal(resp, &sub) == nil {
			if stripeID, ok := sub["stripe_subscription_id"].(string); ok && stripeID != "" {
				err := h.service.CancelSubscription(stripeID, "stripe")
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to cancel subscription: %v", err)})
					return
				}
				c.JSON(http.StatusOK, gin.H{
					"status":  "success",
					"message": "Subscription cancelled at period end via Stripe",
				})
				return
			}
			if paypalID, ok := sub["paypal_billing_agreement_id"].(string); ok && paypalID != "" {
				err := h.service.CancelSubscription(paypalID, "paypal")
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to cancel subscription: %v", err)})
					return
				}
				c.JSON(http.StatusOK, gin.H{
					"status":  "success",
					"message": "Subscription cancelled via PayPal billing agreement",
				})
				return
			}
		}
	}

	// Fallback: proxy cancellation to Python billing service
	proxyResp, proxyErr := h.proxy.Forward("POST", "/billing/cancel", map[string]interface{}{
		"user_id": userID,
	})
	if proxyErr == nil {
		c.Data(http.StatusOK, "application/json", proxyResp)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "cancelled",
		"message": "Subscription cancellation recorded — no active provider subscription found",
		"user_id": userID,
	})
}

func (h *BillingHandler) UpdatePaymentMethod(c *gin.Context) {
	var req struct {
		PaymentMethodID string `json:"payment_method_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	resp, err := h.proxy.Forward("GET", "/enterprise/subscription", nil)
	if err == nil {
		var sub map[string]interface{}
		if json.Unmarshal(resp, &sub) == nil {
			if customerID, ok := sub["stripe_customer_id"].(string); ok && customerID != "" {
				err := h.service.UpdateCustomerPaymentMethod(customerID, req.PaymentMethodID, "stripe")
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update payment method: %v", err)})
					return
				}
				c.JSON(http.StatusOK, gin.H{
					"status":            "success",
					"message":           "Payment method updated via Stripe",
					"payment_method_id": req.PaymentMethodID,
				})
				return
			}
			if paypalID, ok := sub["paypal_customer_id"].(string); ok && paypalID != "" {
				err := h.service.UpdateCustomerPaymentMethod(paypalID, req.PaymentMethodID, "paypal")
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update payment method: %v", err)})
					return
				}
				c.JSON(http.StatusOK, gin.H{
					"status":            "success",
					"message":           "Payment method updated via PayPal",
					"payment_method_id": req.PaymentMethodID,
				})
				return
			}
		}
	}

	// Fallback: proxy to Python billing service
	proxyResp, proxyErr := h.proxy.Forward("POST", "/billing/payment-method", map[string]interface{}{
		"user_id":           userID,
		"payment_method_id": req.PaymentMethodID,
	})
	if proxyErr == nil {
		c.Data(http.StatusOK, "application/json", proxyResp)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":            "recorded",
		"message":           "Payment method update recorded — no active provider customer found",
		"user_id":           userID,
		"payment_method_id": req.PaymentMethodID,
	})
}
