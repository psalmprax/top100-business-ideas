package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type StripeService struct {
	APIKey        string
	WebhookSecret string
	BaseURL       string
}

type StripeCustomer struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Created int64  `json:"created"`
}

type StripeSubscription struct {
	ID                 string `json:"id"`
	Status             string `json:"status"`
	CurrentPeriodStart int64  `json:"current_period_start"`
	CurrentPeriodEnd   int64  `json:"current_period_end"`
	CancelAtPeriodEnd  bool   `json:"cancel_at_period_end"`
}

type StripeInvoice struct {
	ID         string `json:"id"`
	Number     string `json:"number"`
	AmountDue  int    `json:"amount_due"`
	AmountPaid int    `json:"amount_paid"`
	Status     string `json:"status"`
	InvoicePDF string `json:"invoice_pdf"`
	Created    int64  `json:"created"`
}

type StripePaymentIntent struct {
	ID           string `json:"id"`
	Amount       int    `json:"amount"`
	Currency     string `json:"currency"`
	Status       string `json:"status"`
	ClientSecret string `json:"client_secret"`
}

type CheckoutSession struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

type Price struct {
	ID         string `json:"id"`
	ProductID  string `json:"product_id"`
	UnitAmount int    `json:"unit_amount"`
	Currency   string `json:"currency"`
	Recurring  *struct {
		Interval string `json:"interval"`
	} `json:"recurring"`
}

type Product struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Active      bool   `json:"active"`
}

func NewStripeService() *StripeService {
	_ = godotenv.Load()
	return &StripeService{
		APIKey:        os.Getenv("STRIPE_SECRET_KEY"),
		WebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
		BaseURL:       "https://api.stripe.com/v1",
	}
}

func (s *StripeService) doRequest(method, endpoint string, body io.Reader) ([]byte, error) {
	req, err := http.NewRequest(method, s.BaseURL+endpoint, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("stripe error: %s", string(respBody))
	}

	return respBody, nil
}

// Customer operations
func (s *StripeService) CreateCustomer(email, name string) (*StripeCustomer, error) {
	body := fmt.Sprintf("email=%s&name=%s", email, name)
	resp, err := s.doRequest("POST", "/customers", bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}

	var customer StripeCustomer
	if err := json.Unmarshal(resp, &customer); err != nil {
		return nil, err
	}

	return &customer, nil
}

func (s *StripeService) GetCustomer(customerID string) (*StripeCustomer, error) {
	resp, err := s.doRequest("GET", "/customers/"+customerID, nil)
	if err != nil {
		return nil, err
	}

	var customer StripeCustomer
	if err := json.Unmarshal(resp, &customer); err != nil {
		return nil, err
	}

	return &customer, nil
}

// Product operations
func (s *StripeService) CreateProduct(name, description string) (*Product, error) {
	body := fmt.Sprintf("name=%s&description=%s", name, description)
	resp, err := s.doRequest("POST", "/products", bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}

	var product Product
	if err := json.Unmarshal(resp, &product); err != nil {
		return nil, err
	}

	return &product, nil
}

func (s *StripeService) CreatePrice(productID string, unitAmount int, currency, interval string) (*Price, error) {
	body := fmt.Sprintf("product=%s&unit_amount=%d&currency=%s&recurring[interval]=%s",
		productID, unitAmount, currency, interval)
	resp, err := s.doRequest("POST", "/prices", bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}

	var price Price
	if err := json.Unmarshal(resp, &price); err != nil {
		return nil, err
	}

	return &price, nil
}

// Subscription operations
func (s *StripeService) CreateSubscription(customerID, priceID string) (*StripeSubscription, error) {
	body := fmt.Sprintf("customer=%s&items[0][price]=%s", customerID, priceID)
	resp, err := s.doRequest("POST", "/subscriptions", bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}

	var subscription StripeSubscription
	if err := json.Unmarshal(resp, &subscription); err != nil {
		return nil, err
	}

	return &subscription, nil
}

func (s *StripeService) GetSubscription(subscriptionID string) (*StripeSubscription, error) {
	resp, err := s.doRequest("GET", "/subscriptions/"+subscriptionID, nil)
	if err != nil {
		return nil, err
	}

	var subscription StripeSubscription
	if err := json.Unmarshal(resp, &subscription); err != nil {
		return nil, err
	}

	return &subscription, nil
}

func (s *StripeService) CancelSubscription(subscriptionID string) (*StripeSubscription, error) {
	body := "cancel_at_period_end=true"
	resp, err := s.doRequest("POST", "/subscriptions/"+subscriptionID, bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}

	var subscription StripeSubscription
	if err := json.Unmarshal(resp, &subscription); err != nil {
		return nil, err
	}

	return &subscription, nil
}

// Checkout session
func (s *StripeService) CreateCheckoutSession(customerID, priceID, successURL, cancelURL string) (*CheckoutSession, error) {
	body := fmt.Sprintf("mode=subscription&customer=%s&line_items[0][price]=%s&line_items[0][quantity]=1&success_url=%s&cancel_url=%s",
		customerID, priceID, successURL, cancelURL)
	resp, err := s.doRequest("POST", "/checkout/sessions", bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}

	var session CheckoutSession
	if err := json.Unmarshal(resp, &session); err != nil {
		return nil, err
	}

	return &session, nil
}

// Payment intent for usage-based billing
func (s *StripeService) CreatePaymentIntent(amount int, currency, customerID string) (*StripePaymentIntent, error) {
	body := fmt.Sprintf("amount=%d&currency=%s&customer=%s&automatic_payment_methods[enabled]=true",
		amount, currency, customerID)
	resp, err := s.doRequest("POST", "/payment_intents", bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}

	var intent StripePaymentIntent
	if err := json.Unmarshal(resp, &intent); err != nil {
		return nil, err
	}

	return &intent, nil
}

// Invoice operations
func (s *StripeService) GetInvoice(invoiceID string) (*StripeInvoice, error) {
	resp, err := s.doRequest("GET", "/invoices/"+invoiceID, nil)
	if err != nil {
		return nil, err
	}

	var invoice StripeInvoice
	if err := json.Unmarshal(resp, &invoice); err != nil {
		return nil, err
	}

	return &invoice, nil
}

// Webhook verification
func (s *StripeService) ConstructWebhookEvent(payload []byte, signature string) (map[string]interface{}, error) {
	// In production, use stripe's webhook signature verification
	// https://stripe.com/docs/webhooks/signatures
	var event map[string]interface{}
	if err := json.Unmarshal(payload, &event); err != nil {
		return nil, err
	}
	return event, nil
}

// Predefined plans for AlphaAI products
var Plans = map[string]struct {
	Name       string
	PriceID    string
	UnitAmount int
	Currency   string
	Interval   string
}{
	"agentops_developer": {
		Name:       "AgentOps Developer",
		PriceID:    "",
		UnitAmount: 0,
		Currency:   "usd",
		Interval:   "month",
	},
	"agentops_growth": {
		Name:       "AgentOps Growth",
		PriceID:    "",
		UnitAmount: 4900, // £49
		Currency:   "gbp",
		Interval:   "month",
	},
	"agentops_enterprise": {
		Name:       "AgentOps Enterprise",
		PriceID:    "",
		UnitAmount: 85000, // £850
		Currency:   "gbp",
		Interval:   "month",
	},
	"compliance_starter": {
		Name:       "Compliance Starter",
		PriceID:    "",
		UnitAmount: 19900, // £199
		Currency:   "gbp",
		Interval:   "month",
	},
	"compliance_professional": {
		Name:       "Compliance Professional",
		PriceID:    "",
		UnitAmount: 49900, // £499
		Currency:   "gbp",
		Interval:   "month",
	},
	"compliance_enterprise": {
		Name:       "Compliance Enterprise",
		PriceID:    "",
		UnitAmount: 0, // Custom
		Currency:   "usd",
		Interval:   "month",
	},
	"deepfake_treasury_lite": {
		Name:       "Treasury Lite",
		PriceID:    "",
		UnitAmount: 99900, // £999
		Currency:   "gbp",
		Interval:   "month",
	},
	"deepfake_corporate": {
		Name:       "Corporate",
		PriceID:    "",
		UnitAmount: 249900, // £2,499
		Currency:   "gbp",
		Interval:   "month",
	},
	"deepfake_enterprise": {
		Name:       "Enterprise",
		PriceID:    "",
		UnitAmount: 0, // Custom
		Currency:   "usd",
		Interval:   "month",
	},
}

// GetPlanPriceID returns the Stripe price ID for a given plan
func GetPlanPriceID(planName string) string {
	if plan, ok := Plans[planName]; ok {
		return plan.PriceID
	}
	return ""
}
