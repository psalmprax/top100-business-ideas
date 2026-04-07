package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/plutov/paypal/v4"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/subscription"
	"github.com/top100-business-ideas/api/internal/config"
)

type BillingService struct {
	cfg          *config.Config
	stripeKey    string
	paypalClient *paypal.Client
}

func NewBillingService(cfg *config.Config) (*BillingService, error) {
	if cfg.StripeSecretKey == "" {
		return nil, errors.New("STRIPE_SECRET_KEY is required")
	}
	stripe.Key = cfg.StripeSecretKey

	var ppClient *paypal.Client
	if cfg.PayPalClientID != "" && cfg.PayPalSecret != "" {
		var err error
		base := paypal.APIBaseSandBox
		if cfg.PayPalMode == "live" {
			base = paypal.APIBaseLive
		}
		ppClient, err = paypal.NewClient(cfg.PayPalClientID, cfg.PayPalSecret, base)
		if err != nil {
			return nil, fmt.Errorf("failed to create PayPal client: %w", err)
		}
	}

	return &BillingService{
		cfg:          cfg,
		stripeKey:    cfg.StripeSecretKey,
		paypalClient: ppClient,
	}, nil
}

func (s *BillingService) CreateStripeCheckoutSession(planID string, successURL, cancelURL string) (string, error) {
	priceID := s.getPriceIDForPlan(planID)
	if priceID == "" {
		return "", fmt.Errorf("invalid plan ID: %s", planID)
	}

	params := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
	}

	sess, err := session.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create Stripe session: %w", err)
	}

	return sess.URL, nil
}

func (s *BillingService) CreatePayPalOrder(planID string) (string, error) {
	if s.paypalClient == nil {
		return "", errors.New("PayPal client not initialized")
	}

	amount := s.getAmountForPlan(planID)
	if amount == 0 {
		return "", fmt.Errorf("invalid plan ID: %s", planID)
	}

	// For subscriptions, PayPal usually uses Billing Plans/Agreements
	// For simplicity in this implementation, we'll create a standard order
	// In a full implementation, you'd use s.paypalClient.CreateBillingPlan

	order, err := s.paypalClient.CreateOrder(context.Background(), paypal.OrderIntentCapture, []paypal.PurchaseUnitRequest{
		{
			Amount: &paypal.PurchaseUnitAmount{
				Currency: "USD",
				Value:    fmt.Sprintf("%.2f", amount),
			},
			Description: "Subscription for " + planID,
		},
	}, nil, nil)

	if err != nil {
		return "", fmt.Errorf("failed to create PayPal order: %w", err)
	}

	for _, link := range order.Links {
		if link.Rel == "approve" {
			return link.Href, nil
		}
	}

	return "", errors.New("no approval link found in PayPal response")
}

func (s *BillingService) getPriceIDForPlan(planID string) string {
	// These would ideally be in the database or config
	switch planID {
	case "starter":
		return os.Getenv("STRIPE_PRICE_STARTER_ID")
	case "professional":
		return os.Getenv("STRIPE_PRICE_PROFESSIONAL_ID")
	case "enterprise":
		return os.Getenv("STRIPE_PRICE_ENTERPRISE_ID")
	default:
		return ""
	}
}

func (s *BillingService) getAmountForPlan(planID string) float64 {
	switch planID {
	case "starter":
		return 499.00
	case "professional":
		return 1499.00
	case "enterprise":
		return 2500.00
	default:
		return 0
	}
}

func (s *BillingService) CancelSubscription(subscriptionID string, provider string) error {
	if subscriptionID == "" {
		return errors.New("no active subscription to cancel")
	}

	switch provider {
	case "stripe":
		params := &stripe.SubscriptionCancelParams{}
		_, err := subscription.Cancel(subscriptionID, params)
		if err != nil {
			return fmt.Errorf("failed to cancel Stripe subscription: %w", err)
		}
		return nil
	case "paypal":
		if s.paypalClient == nil {
			return errors.New("PayPal client not initialized")
		}
		token, err := s.paypalClient.GetAccessToken(context.Background())
		if err != nil {
			return fmt.Errorf("failed to get PayPal access token: %w", err)
		}
		req, _ := http.NewRequestWithContext(context.Background(), "POST",
			fmt.Sprintf("%s/v1/billing/subscriptions/%s/cancel", s.paypalClient.APIBase, subscriptionID),
			nil)
		req.Header.Set("Authorization", "Bearer "+token.Token)
		req.Header.Set("Content-Type", "application/json")
		resp, err := s.paypalClient.Client.Do(req)
		if err != nil {
			return fmt.Errorf("failed to cancel PayPal subscription: %w", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode >= 400 {
			return fmt.Errorf("PayPal subscription cancel failed with status %d", resp.StatusCode)
		}
		return nil
	default:
		return fmt.Errorf("unsupported payment provider: %s", provider)
	}
}

func (s *BillingService) UpdateCustomerPaymentMethod(customerID, paymentMethodID string, provider string) error {
	if customerID == "" {
		return errors.New("customer ID required")
	}

	switch provider {
	case "stripe":
		params := &stripe.CustomerParams{
			InvoiceSettings: &stripe.CustomerInvoiceSettingsParams{
				DefaultPaymentMethod: stripe.String(paymentMethodID),
			},
		}
		_, err := customer.Update(customerID, params)
		if err != nil {
			return fmt.Errorf("failed to update Stripe customer payment method: %w", err)
		}
		return nil
	case "paypal":
		if s.paypalClient == nil {
			return errors.New("PayPal client not initialized")
		}
		token, err := s.paypalClient.GetAccessToken(context.Background())
		if err != nil {
			return fmt.Errorf("failed to get PayPal access token: %w", err)
		}
		patchData := []map[string]interface{}{
			{
				"op":    "replace",
				"path":  "/payment_source",
				"value": map[string]interface{}{"paypal": map[string]interface{}{"experience_context": map[string]interface{}{"payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED"}}},
			},
		}
		patchBytes, _ := json.Marshal(patchData)
		req, _ := http.NewRequestWithContext(context.Background(), "PATCH",
			fmt.Sprintf("%s/v1/billing/subscriptions/%s", s.paypalClient.APIBase, customerID),
			bytes.NewReader(patchBytes))
		req.Header.Set("Authorization", "Bearer "+token.Token)
		req.Header.Set("Content-Type", "application/json")
		resp, err := s.paypalClient.Client.Do(req)
		if err != nil {
			return fmt.Errorf("failed to update PayPal subscription payment source: %w", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode >= 400 {
			return fmt.Errorf("PayPal payment method update failed with status %d", resp.StatusCode)
		}
		return nil
	default:
		return fmt.Errorf("unsupported payment provider: %s", provider)
	}
}
