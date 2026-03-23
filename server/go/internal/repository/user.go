package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/top100-business-ideas/api/internal/database"
	"github.com/top100-business-ideas/api/internal/models"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	if database.Pool == nil {
		return nil, fmt.Errorf("database pool not initialized")
	}

	var user models.User
	query := `SELECT id, email, name, password_hash, role, subscription_tier, subscription_status, allowed_products, created_at, updated_at 
	          FROM users WHERE email = $1`
	
	err := database.Pool.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.Name, &user.Password, &user.Role,
		&user.SubscriptionTier, &user.SubscriptionStatus, &user.AllowedProducts,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	if database.Pool == nil {
		return nil, fmt.Errorf("database pool not initialized")
	}

	var user models.User
	query := `SELECT id, email, name, password_hash, role, subscription_tier, subscription_status, allowed_products, created_at, updated_at 
	          FROM users WHERE id = $1`
	
	err := database.Pool.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.Name, &user.Password, &user.Role,
		&user.SubscriptionTier, &user.SubscriptionStatus, &user.AllowedProducts,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	if database.Pool == nil {
		return fmt.Errorf("database pool not initialized")
	}

	query := `INSERT INTO users (email, password_hash, name, role, allowed_products) 
	          VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at`
	
	err := database.Pool.QueryRow(ctx, query, 
		user.Email, user.Password, user.Name, user.Role, user.AllowedProducts,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	if database.Pool == nil {
		return fmt.Errorf("database pool not initialized")
	}

	query := `UPDATE users SET email = $1, name = $2, role = $3, subscription_tier = $4, 
	          subscription_status = $5, allowed_products = $6, updated_at = CURRENT_TIMESTAMP 
	          WHERE id = $7`
	
	_, err := database.Pool.Exec(ctx, query, 
		user.Email, user.Name, user.Role, user.SubscriptionTier, 
		user.SubscriptionStatus, user.AllowedProducts, user.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}
