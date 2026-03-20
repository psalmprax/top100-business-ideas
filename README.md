# AlphaAI - Enterprise AI Solutions

<p align="center">
  <img src="https://via.placeholder.com/120x120/2563eb/white?text=AI" alt="AlphaAI Logo" />
</p>

<p align="center">
  <a href="https://localhost:3000">
    <img src="https://img.shields.io/badge/Frontend-Live-brightgreen" alt="Frontend Status" />
  </a>
  <a href="https://localhost:8081">
    <img src="https://img.shields.io/badge/API Gateway-Live-brightgreen" alt="API Status" />
  </a>
  <a href="https://localhost:8000">
    <img src="https://img.shields.io/badge/ML Backend-Live-brightgreen" alt="ML Status" />
  </a>
  <img src="https://img.shields.io/badge/TypeScript-100%25-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

## About AlphaAI

AlphaAI is an enterprise AI company providing production-ready AI solutions. Our platform offers three core products:

- **AgentOps** - Autonomous AI workforce management & Sentinel Guard
- **AI Compliance Hub** - EU AI Act compliance automation & Risk Assessment
- **Deepfake Defense** - AI-powered media authenticity detection
- **Alpha Workforce** - Decentralized Autonomous Corporate Management
- **DenialDefense AI** - Revenue cycle recovery & AI Claims Engine

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                    http://localhost:3000                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API Gateway (Go/Gin)                          │
│                    http://localhost:8081                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   Auth       │  │   Proxy      │  │   WebSocket          │ │
│  │   (JWT)      │  │   Service    │  │   Hub                │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
┌─────────────────────────┐   ┌─────────────────────────────────┐
│   Python Backend       │   │      External Services          │
│   (FastAPI)          │   │                                 │
│   http://localhost:8000│   │   - PostgreSQL (future)        │
│  ┌─────────────────┐  │   │   - Redis (future)             │
│  │ Deepfake        │  │   │   - Auth0 / JWT                │
│  │ Detection       │  │   └─────────────────────────────────┘
│  └─────────────────┐  │
│  ┌─────────────────┐  │
│  │ Compliance      │  │
│  │ Analysis        │  │
│  └─────────────────┘  │
└─────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- Go 1.21+
- Python 3.10+
- pnpm (recommended) or npm

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   # Install frontend dependencies
   cd client && pnpm install
   
   # Install Go dependencies
   cd ../server/go && go mod download
   
   # Install Python dependencies
   cd ../python && pip install -r requirements.txt
   ```

2. **Start all services:**
   ```bash
   # Terminal 1: Frontend
   cd client && pnpm dev
   
   # Terminal 2: Go API Gateway
   cd server/go && PORT=8081 go run cmd/api/main.go
   
   # Terminal 3: Python ML Backend
   cd server/python && PYTHONPATH=. python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

3. **Or use Docker Compose:**
   ```bash
   docker-compose up --build
   ```

### Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React SPA |
| API Gateway | http://localhost:8081 | Go REST API |
| ML Backend | http://localhost:8000 | FastAPI /docs |
| WebSocket | ws://localhost:8081/ws | Real-time |

## API Documentation

### REST Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user

#### Agents (AgentOps)
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/execute` - Execute agent task

#### Compliance
- `GET /api/compliance/score` - Get compliance score
- `POST /api/compliance/analyze` - Analyze AI system
- `GET /api/compliance/reports` - List reports
- `GET /api/compliance/requirements` - List requirements

#### Deepfake Detection
- `POST /api/deepfake/analyze` - Analyze media
- `GET /api/deepfake/history` - Analysis history
- `GET /api/deepfake/threats` - Active threats

#### WebSocket
- `ws://localhost:8081/ws` - Real-time updates

### Persistence & Session Continuity
The Alpha suite features a **namespaced persistence layer** using `localStorage`. This ensures that session-level configurations (e.g., active SLA tiers, agent rosters, fiscal approvals) are preserved across page reloads without requiring immediate backend schema migrations.
- **Utility**: `client/src/lib/storage.ts`
- **Prefix**: `alpha_sentinel_`

### Example Requests

```bash
# Login and get token
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alphaai.com","password":"admin"}'

# Get compliance score (with token)
curl -X GET http://localhost:8081/api/compliance/score \
  -H "Authorization: Bearer YOUR_TOKEN"

# Analyze media for deepfakes
curl -X POST http://localhost:8081/api/deepfake/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@video.mp4"
```

## Project Structure

```
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── AlphaAI.tsx          # Company landing page
│   │   │   ├── AlphaAgentOps.tsx    # AgentOps dashboard (Sentinel)
│   │   │   ├── AlphaAIActCompliance.tsx  # Compliance dashboard
│   │   │   ├── AlphaDeepfakeDefense.tsx  # Deepfake dashboard
│   │   │   ├── AlphaWorkforce.tsx   # Workforce Management
│   │   │   └── DenialDefense.tsx    # AI Claims Engine
│   │   ├── components/       # Reusable components
│   │   ├── lib/              # Utilities (storage.ts, api.ts)
│   │   └── contexts/         # React contexts
│   └── index.html
│
├── server/
│   ├── go/                   # Go API Gateway
│   │   ├── cmd/api/          # Entry point
│   │   ├── internal/
│   │   │   ├── config/       # Configuration
│   │   │   ├── handlers/    # HTTP handlers
│   │   │   ├── middleware/  # Auth, CORS, Logging
│   │   │   ├── models/      # Data models
│   │   │   └── services/    # Business logic
│   │   └── go.mod
│   │
│   └── python/               # Python ML Backend
│       ├── app/
│       │   ├── main.py       # FastAPI app
│       │   ├── api/         # REST endpoints
│       │   ├── ml/          # ML models
│       │   └── core/        # Config, models
│       └── requirements.txt
│
├── docs/                    # Documentation
│   └── ARCHITECTURE.md
│
├── docker-compose.yml       # Docker orchestration
├── Jenkinsfile              # CI/CD Pipeline (Sentinel E2E)
├── playwright.config.ts     # E2E tests
└── package.json            # Root package.json
```

## Technology Stack

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Recharts** - Charts
- **Wouter** - Routing

### Backend (API Gateway)
- **Go 1.21+** - Language
- **Gin** - Web framework
- **JWT** - Authentication
- **Gorilla WebSocket** - Real-time

### Backend (ML)
- **Python 3.10+** - Language
- **FastAPI** - Web framework
- **OpenCV** - Image processing (mock)
- **NumPy** - Numerical computing (mock)

### DevOps
- **Docker** - Containerization
- **Playwright** - E2E testing
- **GitHub Actions** - CI/CD

## Testing

### Run E2E Tests
```bash
# Install Playwright browsers
npx playwright install

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui
```

### Test Coverage

The test suite covers:
- Homepage loading
- Product page navigation
- API authentication
- Real-time WebSocket connections
- Form submissions

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8081
VITE_WS_URL=ws://localhost:8081/ws
```

### Go Backend (.env)
```env
PORT=8081
PYTHON_API_URL=http://localhost:8000
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
```

### Python Backend (.env)
```env
PORT=8000
LOG_LEVEL=info
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE for details.

## Support

- Email: support@alphaai.com
- Documentation: http://localhost:3000/docs
- API Docs: http://localhost:8000/docs
