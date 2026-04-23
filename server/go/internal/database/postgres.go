package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/top100-business-ideas/api/internal/pkg/retry"
)

var Pool *pgxpool.Pool

func Connect(ctx context.Context, dsn string, logger *zerolog.Logger) error {
	var p *pgxpool.Pool
	maxRetries := 5

	policy := retry.RetryPolicy{
		MaxAttempts: maxRetries,
		BaseDelay:   500 * time.Millisecond,
		MaxDelay:    5 * time.Second,
		Jitter:      true,
	}

	err := policy.Do(ctx, func() error {
		poolConfig, perr := pgxpool.ParseConfig(dsn)
		if perr != nil {
			return fmt.Errorf("unable to parse config: %w", perr)
		}

		// Resilience: Production-grade connection pooling
		poolConfig.MaxConns = 50
		poolConfig.MinConns = 10
		poolConfig.MaxConnLifetime = 1 * time.Hour
		poolConfig.MaxConnIdleTime = 30 * time.Minute
		poolConfig.HealthCheckPeriod = 1 * time.Minute

		// Allow tuning via ENV
		if max := os.Getenv("DB_MAX_CONNS"); max != "" {
			fmt.Sscanf(max, "%d", &poolConfig.MaxConns)
		}

		newPool, perr := pgxpool.NewWithConfig(ctx, poolConfig)
		if perr != nil {
			return perr
		}

		if perr := newPool.Ping(ctx); perr != nil {
			newPool.Close()
			return perr
		}

		p = newPool
		return nil
	})

	if err != nil {
		return fmt.Errorf("unable to connect to database after %d attempts: %w", maxRetries, err)
	}

	Pool = p
	logger.Info().Msg("Database connection pool initialized successfully")
	return nil
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
			type VARCHAR(50) NOT NULL,
			environment VARCHAR(50) DEFAULT 'production',
			provider VARCHAR(50) DEFAULT 'openai',
			model VARCHAR(100) DEFAULT 'gpt-4o',
			org_id VARCHAR(255),
			control_webhook VARCHAR(500),
			persistent_memory BOOLEAN DEFAULT TRUE,
			tier VARCHAR(50) DEFAULT 'industrial',
			api_secret VARCHAR(255),
			config JSONB DEFAULT '{}',
			budget FLOAT DEFAULT 10.0,
			daily_spend FLOAT DEFAULT 0.0,
			metrics JSONB DEFAULT '{"costSaved": 0.0, "loopsPrevented": 0, "totalRequests": 0}',
			status VARCHAR(50) DEFAULT 'stopped',
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
			risk_score DECIMAL(5, 4) DEFAULT 0,
			reasoning TEXT,
			metadata_json JSONB DEFAULT '{}',
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
			next_audit TIMESTAMP,
			active_bias_mitigation BOOLEAN DEFAULT false,
			toxic_language_filter BOOLEAN DEFAULT false,
			prompt_privacy_guard BOOLEAN DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Compliance Articles
		`CREATE TABLE IF NOT EXISTS compliance_articles (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
			article VARCHAR(50) NOT NULL,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			risk VARCHAR(50),
			status VARCHAR(50) DEFAULT 'pending',
			evidence TEXT,
			remediation TEXT,
			integration_type VARCHAR(100),
			scan_type VARCHAR(100),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
			media_url VARCHAR(500),
			media_type VARCHAR(50) NOT NULL,
			result VARCHAR(50),
			confidence DECIMAL(5, 2),
			metadata_json JSONB DEFAULT '{}',
			verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

		// Password Reset Tokens
		`CREATE TABLE IF NOT EXISTS password_resets (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			token VARCHAR(255) UNIQUE NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			used BOOLEAN DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// Compliance Audit Logs (HIPAA/SOX/GDPR)
		`CREATE TABLE IF NOT EXISTS compliance_audit_logs (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE SET NULL,
			action VARCHAR(255) NOT NULL,
			resource VARCHAR(255) NOT NULL,
			status VARCHAR(50) DEFAULT 'verified',
			compliance_type VARCHAR(100) NOT NULL,
			metadata_json JSONB DEFAULT '{}',
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// AlphaHecta Extensions - Deepfake Hardening
		`CREATE TABLE IF NOT EXISTS duress_configs (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
			panic_phrase VARCHAR(255) NOT NULL,
			silent_mode BOOLEAN DEFAULT true,
			trigger_action VARCHAR(100) NOT NULL,
			enabled BOOLEAN DEFAULT true,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		// AlphaHecta Extensions - Workforce Hardening
		`CREATE TABLE IF NOT EXISTS workforce_interactions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			agent_role VARCHAR(100) NOT NULL,
			task_description TEXT NOT NULL,
			output_content TEXT NOT NULL,
			user_feedback VARCHAR(50) DEFAULT 'pending',
			feedback_notes TEXT,
			metadata_json JSONB DEFAULT '{}',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS workforce_outreach (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			recipient_name VARCHAR(255) NOT NULL,
			recipient_company VARCHAR(255) NOT NULL,
			subject VARCHAR(255) NOT NULL,
			body TEXT NOT NULL,
			status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
			niche VARCHAR(100),
			score DECIMAL(5, 2) DEFAULT 0.0,
			interaction_id UUID REFERENCES workforce_interactions(id) ON DELETE SET NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS workforce_skills (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			provider VARCHAR(255) DEFAULT 'Alpha Proprietary',
			description TEXT NOT NULL,
			powers_json JSONB DEFAULT '[]',
			is_proprietary BOOLEAN DEFAULT true,
			price VARCHAR(50) DEFAULT '$0',
			status VARCHAR(50) DEFAULT 'active',
			category VARCHAR(100) DEFAULT 'general',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS workforce_ventures (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			sector VARCHAR(100) NOT NULL,
			roi DECIMAL(10, 2) DEFAULT 0.0,
			status VARCHAR(50) DEFAULT 'BETA',
			trend VARCHAR(20) DEFAULT 'up',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS fiscal_requests (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			purpose VARCHAR(255) NOT NULL,
			amount VARCHAR(50) NOT NULL,
			priority VARCHAR(20) DEFAULT 'MEDIUM',
			status VARCHAR(20) DEFAULT 'PENDING',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, m := range migrations {
		if _, err := tx.Exec(ctx, m); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
		"CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status)",
		"CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash)",
		"CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_audit_logs_agent_id ON audit_logs(agent_id)",
		"CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC)",
		"CREATE INDEX IF NOT EXISTS idx_ai_models_user_id ON ai_models(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_compliance_articles_model_id ON compliance_articles(model_id)",
		"CREATE INDEX IF NOT EXISTS idx_budget_rules_agent_id ON budget_rules(agent_id)",
		"CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON agent_metrics(agent_id)",
		"CREATE INDEX IF NOT EXISTS idx_agent_metrics_recorded_at ON agent_metrics(recorded_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_verification_sessions_user_id ON verification_sessions(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_biometric_enrollments_user_id ON biometric_enrollments(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON api_usage(api_key_id)",
		"CREATE INDEX IF NOT EXISTS idx_api_usage_recorded_at ON api_usage(recorded_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)",
		"CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_user_id ON compliance_audit_logs(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_timestamp ON compliance_audit_logs(timestamp DESC)",
		"CREATE INDEX IF NOT EXISTS idx_duress_configs_user_id ON duress_configs(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_forensic_traces_agent_id ON forensic_traces(agent_id)",
		"CREATE INDEX IF NOT EXISTS idx_forensic_traces_timestamp ON forensic_traces(timestamp DESC)",
	}

	for _, idx := range indexes {
		if _, err := tx.Exec(ctx, idx); err != nil {
			return fmt.Errorf("index creation failed: %w", err)
		}
	}

	// Seed Admin User
	adminSeed := "INSERT INTO users (email, password_hash, name, role, allowed_products) " +
		"VALUES ('admin@alpha.ai', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgNIvUUE9q47Vz9.YvXpT3KIdQ2O', 'Alpha Admin', 'admin', '[\"*\"]') " +
		"ON CONFLICT (email) DO UPDATE SET role = 'admin', allowed_products = '[\"*\"]'"
	if _, err := tx.Exec(ctx, adminSeed); err != nil {
		return fmt.Errorf("seeding admin failed: %w", err)
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
