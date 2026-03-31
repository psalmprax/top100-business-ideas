package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var Pool *pgxpool.Pool

type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

func LoadConfig() *Config {
	_ = godotenv.Load()
	port := 5432
	if p := os.Getenv("DB_PORT"); p != "" {
		fmt.Sscanf(p, "%d", &port)
	}
	return &Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     port,
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "postgres"),
		DBName:   getEnv("DB_NAME", "alphaai"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func (c *Config) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
		c.User, c.Password, c.Host, c.Port, c.DBName)
}

func Connect(cfg *Config) error {
	var p *pgxpool.Pool
	var err error
	maxRetries := 10
	
	for i := 0; i < maxRetries; i++ {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		
		poolConfig, perr := pgxpool.ParseConfig(cfg.DSN())
		if perr != nil {
			cancel()
			return fmt.Errorf("unable to parse config: %w", perr)
		}

		poolConfig.MaxConns = 25
		poolConfig.MinConns = 5
		
		p, err = pgxpool.NewWithConfig(ctx, poolConfig)
		if err == nil {
			err = p.Ping(ctx)
			if err == nil {
				cancel()
				Pool = p
				return nil
			}
			p.Close()
		}
		
		cancel()
		fmt.Printf("Database not ready, retrying in 2s... (%d/%d): %v\n", i+1, maxRetries, err)
		time.Sleep(2 * time.Second)
	}

	return fmt.Errorf("unable to connect to database after %d attempts: %w", maxRetries, err)
}

func RunMigrations(ctx context.Context) error {
	if Pool == nil {
		return fmt.Errorf("database pool not initialized")
	}

	tx, err := Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start migration transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	migrations := []string{
		// ... [truncated for brevity in TargetContent matching, but I will provide the full block in ReplacementContent]
		// Users table
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			name VARCHAR(255),
			company VARCHAR(255),
			role VARCHAR(50) DEFAULT 'user',
			stripe_customer_id VARCHAR(255),
			subscription_tier VARCHAR(50) DEFAULT 'free',
			subscription_status VARCHAR(50) DEFAULT 'active',
			allowed_products JSONB DEFAULT '[]',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Organizations table
		`CREATE TABLE IF NOT EXISTS organizations (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			owner_id UUID REFERENCES users(id),
			plan VARCHAR(50) DEFAULT 'free',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Organization members
		`CREATE TABLE IF NOT EXISTS organization_members (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			role VARCHAR(50) DEFAULT 'member',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(organization_id, user_id)
		)`,

		// API Keys table
		`CREATE TABLE IF NOT EXISTS api_keys (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			key_hash VARCHAR(255) NOT NULL,
			prefix VARCHAR(20) NOT NULL,
			rate_limit INTEGER DEFAULT 1000,
			monthly_tokens INTEGER DEFAULT 1000000,
			used_tokens INTEGER DEFAULT 0,
			last_used_at TIMESTAMP,
			expires_at TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			is_active BOOLEAN DEFAULT true
		)`,

		// Agent Ops - Agents table
		`CREATE TABLE IF NOT EXISTS agents (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			agent_type VARCHAR(50) NOT NULL,
			provider VARCHAR(50) NOT NULL,
			model VARCHAR(100) NOT NULL,
			status VARCHAR(50) DEFAULT 'active',
			daily_budget DECIMAL(10, 2) DEFAULT 5.00,
			daily_spend DECIMAL(10, 2) DEFAULT 0.00,
			max_tokens INTEGER DEFAULT 4000,
			temperature DECIMAL(3, 2) DEFAULT 0.7,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Agent Metrics
		`CREATE TABLE IF NOT EXISTS agent_metrics (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
			total_requests INTEGER DEFAULT 0,
			total_tokens INTEGER DEFAULT 0,
			total_cost DECIMAL(10, 4) DEFAULT 0,
			loops_prevented INTEGER DEFAULT 0,
			cost_saved DECIMAL(10, 2) DEFAULT 0,
			avg_latency_ms INTEGER DEFAULT 0,
			error_rate DECIMAL(5, 4) DEFAULT 0,
			recorded_at DATE DEFAULT CURRENT_DATE
		)`,

		// Budget Rules
		`CREATE TABLE IF NOT EXISTS budget_rules (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			rule_type VARCHAR(50) NOT NULL,
			config JSONB NOT NULL,
			is_enabled BOOLEAN DEFAULT true,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Audit Log
		`CREATE TABLE IF NOT EXISTS audit_logs (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
			user_id UUID REFERENCES users(id) ON DELETE SET NULL,
			action VARCHAR(255) NOT NULL,
			intent TEXT,
			outcome VARCHAR(50),
			tokens INTEGER DEFAULT 0,
			cost DECIMAL(10, 4) DEFAULT 0,
			reasoning TEXT,
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// AI Compliance - Models table
		`CREATE TABLE IF NOT EXISTS ai_models (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			risk_category VARCHAR(50) NOT NULL,
			provider VARCHAR(100),
			model_id VARCHAR(100),
			status VARCHAR(50) DEFAULT 'pending',
			compliance_score DECIMAL(5, 2) DEFAULT 0,
			last_audit TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Compliance Articles
		`CREATE TABLE IF NOT EXISTS compliance_articles (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
			article VARCHAR(50) NOT NULL,
			title VARCHAR(255) NOT NULL,
			status VARCHAR(50) DEFAULT 'pending',
			evidence TEXT,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Bias Reports
		`CREATE TABLE IF NOT EXISTS bias_reports (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
			protected_class VARCHAR(100) NOT NULL,
			disparate_impact DECIMAL(5, 4),
			statistical_significance DECIMAL(5, 4),
			status VARCHAR(50) DEFAULT 'pending',
			details TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Compliance Reports
		`CREATE TABLE IF NOT EXISTS compliance_reports (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
			report_type VARCHAR(50) NOT NULL,
			file_path VARCHAR(500),
			generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Deepfake - Verification Sessions
		`CREATE TABLE IF NOT EXISTS verification_sessions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			media_type VARCHAR(50) NOT NULL,
			result VARCHAR(50),
			confidence DECIMAL(5, 2),
			verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Threat Reports
		`CREATE TABLE IF NOT EXISTS threat_reports (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			threat_type VARCHAR(100) NOT NULL,
			severity VARCHAR(50),
			details JSONB,
			detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Biometric Enrollments
		`CREATE TABLE IF NOT EXISTS biometric_enrollments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			enrollment_type VARCHAR(50) NOT NULL,
			device_id VARCHAR(255),
			is_active BOOLEAN DEFAULT true,
			enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Subscriptions
		`CREATE TABLE IF NOT EXISTS subscriptions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			stripe_subscription_id VARCHAR(255) UNIQUE,
			plan VARCHAR(50) NOT NULL,
			status VARCHAR(50) NOT NULL,
			current_period_start TIMESTAMP,
			current_period_end TIMESTAMP,
			cancel_at_period_end BOOLEAN DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Payments
		`CREATE TABLE IF NOT EXISTS payments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			stripe_payment_id VARCHAR(255) UNIQUE,
			amount INTEGER NOT NULL,
			currency VARCHAR(10) DEFAULT 'usd',
			status VARCHAR(50) NOT NULL,
			description TEXT,
			paid_at TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// API Usage
		`CREATE TABLE IF NOT EXISTS api_usage (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
			endpoint VARCHAR(255) NOT NULL,
			method VARCHAR(10) NOT NULL,
			status_code INTEGER,
			latency_ms INTEGER,
			tokens_used INTEGER DEFAULT 0,
			cost DECIMAL(10, 6) DEFAULT 0,
			recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Webhooks
		`CREATE TABLE IF NOT EXISTS webhooks (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			url VARCHAR(500) NOT NULL,
			events JSONB NOT NULL,
			secret VARCHAR(255),
			is_active BOOLEAN DEFAULT true,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// --- NEW TABLES FOR REAL-FIRST HARDENING ---

		// Freelancer workflow - Tasks
		`CREATE TABLE IF NOT EXISTS tasks (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			status VARCHAR(50) DEFAULT 'todo',
			priority VARCHAR(50) DEFAULT 'medium',
			due_date TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Freelancer workflow - Clients
		`CREATE TABLE IF NOT EXISTS clients (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255),
			company VARCHAR(255),
			status VARCHAR(50) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Freelancer workflow - Calendar Events
		`CREATE TABLE IF NOT EXISTS calendar_events (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			start_time TIMESTAMP NOT NULL,
			end_time TIMESTAMP NOT NULL,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Freelancer workflow - Audit Notes
		`CREATE TABLE IF NOT EXISTS audit_notes (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			content TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Workforce - Governance Decisions
		`CREATE TABLE IF NOT EXISTS governance_decisions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			stage INTEGER NOT NULL,
			decision VARCHAR(50) NOT NULL,
			status VARCHAR(50) DEFAULT 'recorded',
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Workforce - Campaigns
		`CREATE TABLE IF NOT EXISTS workforce_campaigns (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			target_audience VARCHAR(255),
			status VARCHAR(50) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Workforce - Forensic Traces
		`CREATE TABLE IF NOT EXISTS forensic_traces (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
			action VARCHAR(255) NOT NULL,
			details JSONB,
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Denial Defense - Claims
		`CREATE TABLE IF NOT EXISTS claims (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			claim_id_string VARCHAR(100) NOT NULL,
			payer VARCHAR(255) NOT NULL,
			amount DECIMAL(12, 2) NOT NULL,
			status VARCHAR(50) DEFAULT 'pending',
			risk VARCHAR(50) DEFAULT 'unknown',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, migration := range migrations {
		if _, err := tx.Exec(ctx, migration); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit migration transaction: %w", err)
	}

	return nil
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
