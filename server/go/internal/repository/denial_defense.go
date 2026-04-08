package repository

import (
	"context"
	"fmt"

	"github.com/top100-business-ideas/api/internal/database"
	"github.com/top100-business-ideas/api/internal/models"
)

type DenialDefenseRepository struct{}

func NewDenialDefenseRepository() *DenialDefenseRepository {
	return &DenialDefenseRepository{}
}

func (r *DenialDefenseRepository) ListClaims(ctx context.Context, userID string) ([]models.Claim, error) {
	if database.Pool == nil {
		return nil, fmt.Errorf("database pool not initialized")
	}

	query := `SELECT id, user_id, claim_id_string, payer, amount, status, risk, created_at, updated_at 
	          FROM claims WHERE user_id = $1 ORDER BY created_at DESC`

	rows, err := database.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var claims []models.Claim
	for rows.Next() {
		var c models.Claim
		err := rows.Scan(&c.ID, &c.UserID, &c.ClaimIDString, &c.Payer, &c.Amount, &c.Status, &c.Risk, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
		claims = append(claims, c)
	}
	return claims, nil
}

func (r *DenialDefenseRepository) CreateClaim(ctx context.Context, c *models.Claim) error {
	query := `INSERT INTO claims (user_id, claim_id_string, payer, amount, status, risk) 
	          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at, updated_at`

	return database.Pool.QueryRow(ctx, query, c.UserID, c.ClaimIDString, c.Payer, c.Amount, c.Status, c.Risk).Scan(
		&c.ID, &c.CreatedAt, &c.UpdatedAt,
	)
}

func (r *DenialDefenseRepository) UpdateClaim(ctx context.Context, c *models.Claim) error {
	query := `UPDATE claims SET status = $1, risk = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4`
	_, err := database.Pool.Exec(ctx, query, c.Status, c.Risk, c.ID, c.UserID)
	return err
}
