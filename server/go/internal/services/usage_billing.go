package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// UsageMetrics holds usage data for billing
type UsageMetrics struct {
	UserID       string    `json:"user_id"`
	PlanID       string    `json:"plan_id"`
	TokensUsed   int64     `json:"tokens_used"`
	AgentsActive int       `json:"agents_active"`
	APICalls     int64     `json:"api_calls"`
	StorageMB    float64   `json:"storage_mb"`
	PeriodStart  time.Time `json:"period_start"`
	PeriodEnd    time.Time `json:"period_end"`
	CalculatedAt time.Time `json:"calculated_at"`
}

// PlanLimits defines limits for each plan
type PlanLimits struct {
	PlanID          string  `json:"plan_id"`
	MonthlyTokens   int64   `json:"monthly_tokens"`
	MaxAgents       int     `json:"max_agents"`
	MonthlyAPICalls int64   `json:"monthly_api_calls"`
	StorageMB       float64 `json:"storage_mb"`
	OverageRate     float64 `json:"overage_rate"` // per 1K tokens
}

// UsageBillingService handles usage-based billing
type UsageBillingService struct {
	db *sql.DB
}

var planLimits = map[string]PlanLimits{
	"developer": {
		PlanID:          "developer",
		MonthlyTokens:   1_000_000, // 1M tokens/mo
		MaxAgents:       1,
		MonthlyAPICalls: 100_000,
		StorageMB:       100,
		OverageRate:     0.01, // $0.01 per 1K tokens
	},
	"starter": {
		PlanID:          "starter",
		MonthlyTokens:   3_000_000, // 100K/day * 30
		MaxAgents:       5,
		MonthlyAPICalls: 500_000,
		StorageMB:       500,
		OverageRate:     0.008, // $0.008 per 1K tokens
	},
	"professional": {
		PlanID:          "professional",
		MonthlyTokens:   30_000_000, // 1M/day * 30
		MaxAgents:       25,
		MonthlyAPICalls: 2_000_000,
		StorageMB:       2000,
		OverageRate:     0.005, // $0.005 per 1K tokens
	},
	"enterprise": {
		PlanID:          "enterprise",
		MonthlyTokens:   -1, // unlimited
		MaxAgents:       -1, // unlimited
		MonthlyAPICalls: -1, // unlimited
		StorageMB:       10000,
		OverageRate:     0, // custom pricing
	},
}

// NewUsageBillingService creates a new usage billing service
func NewUsageBillingService(db *sql.DB) *UsageBillingService {
	return &UsageBillingService{db: db}
}

// RecordUsage records usage metrics for a user
func (s *UsageBillingService) RecordUsage(ctx context.Context, metrics *UsageMetrics) error {
	query := `
		INSERT INTO usage_metrics (user_id, plan_id, tokens_used, agents_active, api_calls, storage_mb, period_start, period_end)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id, plan_id, period_start)
		DO UPDATE SET
			tokens_used = usage_metrics.tokens_used + $3,
			agents_active = $4,
			api_calls = usage_metrics.api_calls + $5,
			storage_mb = $6
	`
	_, err := s.db.ExecContext(ctx, query,
		metrics.UserID,
		metrics.PlanID,
		metrics.TokensUsed,
		metrics.AgentsActive,
		metrics.APICalls,
		metrics.StorageMB,
		metrics.PeriodStart,
		metrics.PeriodEnd,
	)
	return err
}

// GetUsageForPeriod gets usage metrics for a specific period
func (s *UsageBillingService) GetUsageForPeriod(ctx context.Context, userID string, start, end time.Time) (*UsageMetrics, error) {
	query := `
		SELECT user_id, plan_id, COALESCE(SUM(tokens_used), 0), MAX(agents_active), COALESCE(SUM(api_calls), 0), COALESCE(MAX(storage_mb), 0)
		FROM usage_metrics
		WHERE user_id = $1 AND period_start >= $2 AND period_end <= $3
		GROUP BY user_id, plan_id
	`
	metrics := &UsageMetrics{}
	err := s.db.QueryRowContext(ctx, query, userID, start, end).Scan(
		&metrics.UserID,
		&metrics.PlanID,
		&metrics.TokensUsed,
		&metrics.AgentsActive,
		&metrics.APICalls,
		&metrics.StorageMB,
	)
	if err == sql.ErrNoRows {
		return &UsageMetrics{
			UserID:      userID,
			PeriodStart: start,
			PeriodEnd:   end,
		}, nil
	}
	if err != nil {
		return nil, err
	}
	metrics.PeriodStart = start
	metrics.PeriodEnd = end
	return metrics, nil
}

// CalculateOverage calculates overage charges
func (s *UsageBillingService) CalculateOverage(ctx context.Context, userID string, planID string) (*BillingOverage, error) {
	limits, ok := planLimits[planID]
	if !ok {
		return nil, fmt.Errorf("unknown plan: %s", planID)
	}

	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)

	usage, err := s.GetUsageForPeriod(ctx, userID, startOfMonth, endOfMonth)
	if err != nil {
		return nil, err
	}

	overage := &BillingOverage{
		UserID:      userID,
		PlanID:      planID,
		PeriodStart: startOfMonth,
		PeriodEnd:   endOfMonth,
	}

	// Calculate token overage
	if limits.MonthlyTokens > 0 && usage.TokensUsed > limits.MonthlyTokens {
		overageTokenOverage := usage.TokensUsed - limits.MonthlyTokens
		overage.TokensOverage = overageTokenOverage
		overage.TokensOverageCost = float64(overageTokenOverage) / 1000 * limits.OverageRate
	}

	// Calculate API calls overage
	if limits.MonthlyAPICalls > 0 && usage.APICalls > limits.MonthlyAPICalls {
		overageAPIOverage := usage.APICalls - limits.MonthlyAPICalls
		overage.APICallsOverage = overageAPIOverage
		overage.APICallsOverageCost = float64(overageAPIOverage) / 1000 * limits.OverageRate * 0.5
	}

	// Calculate agent overage
	if limits.MaxAgents > 0 && usage.AgentsActive > limits.MaxAgents {
		overage.AgentsOverage = usage.AgentsActive - limits.MaxAgents
		overage.AgentsOverageCost = float64(overage.AgentsOverage) * 99.0 // $99 per extra agent
	}

	overage.TotalOverageCost = overage.TokensOverageCost + overage.APICallsOverageCost + overage.AgentsOverageCost

	return overage, nil
}

// BillingOverage holds overage billing details
type BillingOverage struct {
	UserID              string    `json:"user_id"`
	PlanID              string    `json:"plan_id"`
	PeriodStart         time.Time `json:"period_start"`
	PeriodEnd           time.Time `json:"period_end"`
	TokensOverage       int64     `json:"tokens_overage"`
	TokensOverageCost   float64   `json:"tokens_overage_cost"`
	APICallsOverage     int64     `json:"api_calls_overage"`
	APICallsOverageCost float64   `json:"api_calls_overage_cost"`
	AgentsOverage       int       `json:"agents_overage"`
	AgentsOverageCost   float64   `json:"agents_overage_cost"`
	TotalOverageCost    float64   `json:"total_overage_cost"`
}

// GetPlanLimits returns plan limits
func GetPlanLimits(planID string) (PlanLimits, bool) {
	limits, ok := planLimits[planID]
	return limits, ok
}

// GenerateUsageReport generates a usage report for billing
func (s *UsageBillingService) GenerateUsageReport(ctx context.Context, userID string, start, end time.Time) ([]UsageMetrics, error) {
	query := `
		SELECT user_id, plan_id, tokens_used, agents_active, api_calls, storage_mb, period_start, period_end
		FROM usage_metrics
		WHERE user_id = $1 AND period_start >= $2 AND period_end <= $3
		ORDER BY period_start DESC
	`
	rows, err := s.db.QueryContext(ctx, query, userID, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reports []UsageMetrics
	for rows.Next() {
		var m UsageMetrics
		err := rows.Scan(
			&m.UserID,
			&m.PlanID,
			&m.TokensUsed,
			&m.AgentsActive,
			&m.APICalls,
			&m.StorageMB,
			&m.PeriodStart,
			&m.PeriodEnd,
		)
		if err != nil {
			return nil, err
		}
		reports = append(reports, m)
	}

	return reports, nil
}

// UsageAlert represents a usage threshold alert
type UsageAlert struct {
	UserID    string    `json:"user_id"`
	PlanID    string    `json:"plan_id"`
	AlertType string    `json:"alert_type"` // tokens, api_calls, agents
	Threshold float64   `json:"threshold"`  // percentage (0.75 = 75%)
	Current   float64   `json:"current"`
	SentAt    time.Time `json:"sent_at"`
}

// CheckUsageAlerts checks if any usage alerts should be triggered
func (s *UsageBillingService) CheckUsageAlerts(ctx context.Context, userID string) ([]UsageAlert, error) {
	planID, err := s.getUserPlan(ctx, userID)
	if err != nil {
		return nil, err
	}

	limits, ok := planLimits[planID]
	if !ok {
		return nil, fmt.Errorf("unknown plan: %s", planID)
	}

	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)

	usage, err := s.GetUsageForPeriod(ctx, userID, startOfMonth, endOfMonth)
	if err != nil {
		return nil, err
	}

	var alerts []UsageAlert

	// Check token usage
	if limits.MonthlyTokens > 0 {
		tokenPct := float64(usage.TokensUsed) / float64(limits.MonthlyTokens)
		if tokenPct >= 0.75 {
			alerts = append(alerts, UsageAlert{
				UserID:    userID,
				PlanID:    planID,
				AlertType: "tokens",
				Threshold: 0.75,
				Current:   tokenPct,
				SentAt:    now,
			})
		}
	}

	// Check API calls
	if limits.MonthlyAPICalls > 0 {
		apiPct := float64(usage.APICalls) / float64(limits.MonthlyAPICalls)
		if apiPct >= 0.75 {
			alerts = append(alerts, UsageAlert{
				UserID:    userID,
				PlanID:    planID,
				AlertType: "api_calls",
				Threshold: 0.75,
				Current:   apiPct,
				SentAt:    now,
			})
		}
	}

	// Check agent count
	if limits.MaxAgents > 0 {
		agentPct := float64(usage.AgentsActive) / float64(limits.MaxAgents)
		if agentPct >= 0.75 {
			alerts = append(alerts, UsageAlert{
				UserID:    userID,
				PlanID:    planID,
				AlertType: "agents",
				Threshold: 0.75,
				Current:   agentPct,
				SentAt:    now,
			})
		}
	}

	return alerts, nil
}

func (s *UsageBillingService) getUserPlan(ctx context.Context, userID string) (string, error) {
	var planID string
	query := `SELECT plan_id FROM users WHERE id = $1`
	err := s.db.QueryRowContext(ctx, query, userID).Scan(&planID)
	if err == sql.ErrNoRows {
		return "developer", nil // default plan
	}
	if err != nil {
		return "", err
	}
	return planID, nil
}

// Serialize serializes usage data to JSON
func (m *UsageMetrics) Serialize() (string, error) {
	data, err := json.Marshal(m)
	if err != nil {
		return "", err
	}
	return string(data), nil
}
