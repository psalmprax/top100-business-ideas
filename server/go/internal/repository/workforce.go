package repository

import (
	"context"
	"fmt"

	"github.com/top100-business-ideas/api/internal/database"
	"github.com/top100-business-ideas/api/internal/models"
)

type WorkforceRepository struct{}

func NewWorkforceRepository() *WorkforceRepository {
	return &WorkforceRepository{}
}

// Governance Decisions
func (r *WorkforceRepository) ListGovernanceDecisions(ctx context.Context, userID string) ([]models.GovernanceDecision, error) {
	if database.Pool == nil {
		return nil, fmt.Errorf("database pool not initialized")
	}

	query := `SELECT id, user_id, stage, decision, status, timestamp 
	          FROM governance_decisions WHERE user_id = $1 ORDER BY timestamp DESC`
	
	rows, err := database.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var decisions []models.GovernanceDecision
	for rows.Next() {
		var d models.GovernanceDecision
		err := rows.Scan(&d.ID, &d.UserID, &d.Stage, &d.Decision, &d.Status, &d.Timestamp)
		if err != nil {
			return nil, err
		}
		decisions = append(decisions, d)
	}
	return decisions, nil
}

func (r *WorkforceRepository) CreateGovernanceDecision(ctx context.Context, d *models.GovernanceDecision) error {
	query := `INSERT INTO governance_decisions (user_id, stage, decision, status) 
	          VALUES ($1, $2, $3, $4) RETURNING id, timestamp`
	
	return database.Pool.QueryRow(ctx, query, d.UserID, d.Stage, d.Decision, d.Status).Scan(&d.ID, &d.Timestamp)
}

// Campaigns
func (r *WorkforceRepository) ListCampaigns(ctx context.Context, userID string) ([]models.WorkforceCampaign, error) {
	query := `SELECT id, user_id, name, target_audience, status, created_at 
	          FROM workforce_campaigns WHERE user_id = $1 ORDER BY created_at DESC`
	
	rows, err := database.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var campaigns []models.WorkforceCampaign
	for rows.Next() {
		var c models.WorkforceCampaign
		err := rows.Scan(&c.ID, &c.UserID, &c.Name, &c.TargetAudience, &c.Status, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		campaigns = append(campaigns, c)
	}
	return campaigns, nil
}

func (r *WorkforceRepository) CreateCampaign(ctx context.Context, c *models.WorkforceCampaign) error {
	query := `INSERT INTO workforce_campaigns (user_id, name, target_audience, status) 
	          VALUES ($1, $2, $3, $4) RETURNING id, created_at`
	
	return database.Pool.QueryRow(ctx, query, c.UserID, c.Name, c.TargetAudience, c.Status).Scan(&c.ID, &c.CreatedAt)
}

// Forensic Traces
func (r *WorkforceRepository) ListForensicTraces(ctx context.Context, userID string) ([]models.ForensicTrace, error) {
	query := `SELECT id, user_id, agent_id, action, details, timestamp 
	          FROM forensic_traces WHERE user_id = $1 ORDER BY timestamp DESC`
	
	rows, err := database.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var traces []models.ForensicTrace
	for rows.Next() {
		var t models.ForensicTrace
		err := rows.Scan(&t.ID, &t.UserID, &t.AgentID, &t.Action, &t.Details, &t.Timestamp)
		if err != nil {
			return nil, err
		}
		traces = append(traces, t)
	}
	return traces, nil
}

func (r *WorkforceRepository) CreateForensicTrace(ctx context.Context, t *models.ForensicTrace) error {
	query := `INSERT INTO forensic_traces (user_id, agent_id, action, details) 
	          VALUES ($1, $2, $3, $4) RETURNING id, timestamp`
	
	return database.Pool.QueryRow(ctx, query, t.UserID, t.AgentID, t.Action, t.Details).Scan(&t.ID, &t.Timestamp)
}
