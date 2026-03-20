# AlphaAI Products Implementation Guide

## Overview

This guide documents the complete implementation of the first 3 AlphaAI products:
1. **Agent Ops** - AI-powered agent operations optimization & Sentinel Guard
2. **AI Compliance** - Regulatory compliance checking for AI systems
3. **Deepfake Defense** - Detection and prevention of deepfake media
4. **Alpha Workforce** - Autonomous corporate management
5. **DenialDefense AI** - AI-powered revenue cycle & claims engine

---

## Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI, wouter
- **Backend (API)**: Go (Gin), PostgreSQL, Redis
- **ML Backend**: Python (FastAPI), PyTorch/Transformers
- **Infrastructure**: Docker, Docker Compose

### Project Structure
```
top100-business-ideas/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── AlphaAgentOps.tsx
│   │   │   ├── AlphaAIActCompliance.tsx
│   │   │   ├── AlphaDeepfakeDefense.tsx
│   │   │   ├── AlphaWorkforce.tsx
│   │   │   ├── DenialDefense.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Billing.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/        # UI components
│   │   ├── contexts/          # React contexts
│   │   └── lib/              # Utilities
│   └── package.json
├── server/
│   ├── go/                   # Go API server
│   │   ├── cmd/api/          # Main application
│   │   └── internal/
│   │       ├── config/       # Configuration
│   │       ├── database/     # DB connections
│   │       ├── handlers/     # HTTP handlers
│   │       ├── middleware/   # Middleware
│   │       └── services/     # Business logic
│   └── python/               # Python ML server
│       └── app/
│           ├── api/          # API endpoints
│           └── services/     # ML services
├── tests/                    # Tests
│   └── e2e/                 # E2E tests
├── docker-compose.yml        # Docker configuration
└── package.json             # Root package.json
```

---

## Step-by-Step Implementation

### Step 1: Database Setup (PostgreSQL)

**File**: `server/go/internal/database/postgres.go`

```go
// PostgreSQL schema includes:
// - users: User accounts
// - organizations: Company/team accounts
// - subscriptions: Subscription plans
// - api_keys: API authentication
// - usage_records: Token/API usage tracking
// - webhooks: Webhook configurations
// - audit_logs: Security audit trail
```

**Setup**:
1. Run PostgreSQL container
2. Execute schema creation
3. Configure connection pooling

### Step 2: Cache Setup (Redis)

**File**: `server/go/internal/database/redis.go`

```go
// Redis usage:
// - Session storage
// - API response caching
// - Rate limiting tokens
// - Semantic caching for ML
```

### Step 3: Authentication

**Frontend**: `client/src/contexts/AuthContext.tsx`
- Login/logout state management
- JWT token handling
- OAuth integration (Google, GitHub, Microsoft)

**Backend**: JWT middleware
- Token generation/validation
- Role-based access control

### Step 4: Payments (Stripe)

**File**: `server/go/internal/services/stripe.go`

Features:
- Subscription management
- Invoice generation
- Webhook handling
- Usage-based billing

**Frontend**: `client/src/pages/Billing.tsx`
- Plan selection
- Payment method management
- Invoice history

### Step 5: Rate Limiting

**File**: `server/go/internal/middleware/ratelimit.go`

```go
// Token bucket algorithm
// Per-IP and per-API-key limits
// Configurable tiers (free, basic, pro)
```

### Step 6: File Upload

**File**: `server/go/internal/services/upload.go`

Features:
- File validation (size, type)
- Local and cloud storage
- Cleanup automation

### Step 7: Email Service

**File**: `server/go/internal/services/email.go`

Email types:
- Welcome emails
- Password reset
- Invoice notifications
- Usage alerts

### Step 8: Logging

**File**: `server/go/internal/services/logger.go`

Features:
- Structured JSON logging
- Log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Request tracing
- Custom fields

### Step 9: Loading States & Error Handling

**File**: `client/src/components/ui/loading.tsx`

Components:
- LoadingSpinner
- FullScreenLoading
- Skeleton components
- ErrorDisplay
- EmptyState

### Step 10: ML Inference

**File**: `server/python/app/services/ml_inference.py`

Models:
- **Agent Ops**: Task classification, optimization suggestions
- **AI Compliance**: GDPR/AI Act compliance checking
- **Deepfake Defense**: Audio/video deepfake detection

**API**: `server/python/app/api/ml_endpoints.py`

### Step 11: Testing

**Sentinel Functional Tests**: `client/src/test/sentinel-functional.spec.ts`
- Verifies persistence of SLA tiers and Alert rules.
- Valides the AI Scrubber logic in DenialDefense.

**E2E Tests**: `tests/e2e/alpha-products.spec.ts`
- Landing page tests
- Authentication tests
- Billing flow tests
- Product page tests
- Responsive design tests

### Step 12: Persistence Layer (localStorage)

**File**: `client/src/lib/storage.ts`

Features:
- Namespaced storage (`alpha_sentinel_`) to prevent collisions.
- Session continuity for Alpha products without backend migrations.
- Automatic JSON serialization/deserialization.

**Unit Tests**:
- `server/go/internal/services/logger_test.go`
- `server/go/internal/middleware/ratelimit_test.go`

---

## Running the Application

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Go 1.21+
- Python 3.10+

### Start Development Environment

```bash
# Start all services
docker-compose up -d

# Or start individually:
# Frontend
cd client && npm run dev

# Go API
cd server/go && go run cmd/api/main.go

# Python ML
cd server/python && python -m uvicorn app.main:app --reload
```

### Ports
| Service | URL | Stack |
|---------|-----|-------|
| Frontend | http://localhost:7000 | Vite + React + Lucide |
| API Gateway | http://localhost:7001 | Go (Gin) |
| AI Backend | http://localhost:7002 | Python (FastAPI) |
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token

### Products
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products/:id/validate` - Validate product

### Billing
- `GET /api/v1/billing/subscription` - Get subscription
- `POST /api/v1/billing/checkout` - Create checkout session
- `POST /api/v1/billing/webhook` - Stripe webhook

### ML Inference (Direct Gateway Proxy)
-   **Python 3.10+**: Core language
-   **FastAPI**: Web framework for AI/ML inference
-   **PyTorch / Transformers**: Deep learning and LLM interaction
-   **OpenCV**: Image and video processing
-   **NumPy / Pandas**: Numerical and data analysis
-   **CrewAI / LangChain**: Multi-agent orchestration

---

## Product Features

### Agent Ops
- Task classification
- Workflow optimization
- Performance suggestions
- API integration patterns
- Database operation optimization

### AI Compliance
- GDPR compliance checking
- AI Act compliance
- PII detection
- Bias assessment
- Transparency checks

### Deepfake Defense
- Video deepfake detection
- Audio deepfake detection
- Frame-by-frame analysis
- Biometric verification

### Alpha Workforce
- Autonomous Agent Roster Management (Hiring/Firing)
- Fiscal Governance & AI CFO Approval Workflows
- Decentralized Strategy Refinement

### DenialDefense AI
- AI Claims Scrubbing (CCI Edit Detection)
- Denial Prediction & Risk Profiling
- Autonomous Appeal Generation

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/alphaai
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
OAUTH_GITHUB_ID=your-github-id
OAUTH_GITHUB_SECRET=your-github-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# ML
PYTORCH_AVAILABLE=false
MODEL_CACHE_DIR=/models
```

---

## Deployment

### Production Checklist
- [ ] Set up PostgreSQL with SSL
- [ ] Configure Redis with persistence
- [ ] Set up Stripe production keys
- [ ] Configure OAuth redirect URIs
- [ ] Set up email sending (SendGrid/Mailgun)
- [ ] Load actual ML models
- [ ] Configure SSL/TLS
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Docker Production
```bash
docker build -t alphaai/api server/go
docker build -t alphaai/ml server/python
docker build -t alphaai/client client

docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Redis Connection Failed**
   - Check REDIS_URL
   - Verify Redis is running

3. **ML Inference Not Working**
   - Check PyTorch installation
   - Verify model files exist
   - Check GPU availability

4. **Stripe Webhooks Failing**
   - Verify webhook secret
   - Check Stripe dashboard logs

---

## Next Steps

1. Add more ML models
2. Implement real OAuth flow
3. Set up monitoring
4. Add more tests
5. Performance optimization
6. Security audit
