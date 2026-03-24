package services

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/plutov/paypal/v4"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
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
