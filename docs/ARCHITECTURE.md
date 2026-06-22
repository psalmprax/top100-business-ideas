# Top100 Business Ideas - Technical Architecture

## Overview

The Top100 Business Ideas platform is a multi-venture portfolio with a full-stack architecture designed for high quality, scalability, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                    http://localhost:3000                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API Gateway (Go/Gin)                          │
│                    http://localhost:8080                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   Auth       │  │   Proxy      │  │   WebSocket      │   │
│  │   (JWT)      │  │   Service    │  │   Hub           │   │
│  └──────────────┘  └──────────────┘  └───────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
┌─────────────────────────┐   ┌─────────────────────────────────┐
│   Python Backend        │   │      PostgreSQL + Redis         │
│   (FastAPI)            │   │                                 │
│   http://localhost:8000│   │                                 │
│  ┌─────────────────┐  │   └─────────────────────────────────┘
│  │ Deepfake        │  │
│  │ Detection       │  │
│  └─────────────────┘  │
│  ┌─────────────────┐  │
│  │ Compliance      │  │
│  │ Analysis        │  │
│  └─────────────────┘  │
└─────────────────────────┘
```

## Technology Stack

### Frontend

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Wouter** - Routing
- **React Query** - Data fetching

### API Gateway (Go)

- **Gin** - HTTP web framework
- **JWT** - Authentication
- **Gorilla WebSocket** - Real-time updates
- **Zerolog** - Structured logging
- **BCrypt** - Password hashing

### AI/ML Backend (Python)

- **FastAPI** - REST API framework
- **SQLModel** - ORM (Agnostic Bridge)
- **Alembic** - Database Migrations
- **PyTorch** - ML framework
- **Transformers** - NLP models
- **OpenCV** - Computer vision
- **Pillow** - Image processing

## Project Structure

```
top100-business-ideas/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── AlphaAgentOps.tsx
│   │   │   ├── AlphaHectaActCompliance.tsx
│   │   │   └── AlphaDeepfakeDefense.tsx
│   │   ├── lib/              # API client, types, utilities
│   │   └── components/       # UI components
│   └── package.json
│
├── server/
│   ├── go/                   # Go API Gateway
│   │   ├── cmd/api/          # Main application
│   │   ├── internal/
│   │   │   ├── config/       # Configuration
│   │   │   ├── handlers/    # HTTP handlers
│   │   │   ├── middleware/  # Middleware
│   │   │   ├── models/      # Data models
│   │   │   └── services/    # Business logic
│   │   └── go.mod
│   │
│   └── python/               # Python AI/ML Backend
│       ├── app/
│       │   ├── api/          # API routes
│       │   ├── core/         # Config, models
│       │   └── ml/           # ML modules
│       └── requirements.txt
│
├── docker-compose.yml        # Full stack orchestration
├── docs/                     # Documentation
└── .github/workflows/        # CI/CD pipelines
```

## Core Features

### 1. Alpha Agent Operations

- Real-time agent monitoring
- Agent lifecycle management (create, start, stop, restart)
- Performance metrics tracking
- Log aggregation

### 2. Alpha AI Act Compliance

- EU AI Act compliance checking
- Risk category classification
- Compliance report generation
- Finding recommendations

### 3. Alpha Deepfake Defense

- Image deepfake detection
- Video deepfake detection
- Audio deepfake detection
- Confidence scoring

### 4. Agent Skill Marketplace

- Hybrid Gated Discovery (Public/Internal)
- "Proprietary Shield" intellectual property protection
- Direct skill-to-venture mapping (v001 - v100)
- Verified provider transparency (ClawHub, GitHub)

## Running the Application

### Prerequisites

- Node.js 18+
- Go 1.21+
- Python 3.11+
- pnpm (optional, npm works too)

### Option 1: Running Locally (Recommended)

#### 1. Start Python Backend (AI/ML)

```bash
cd server/python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# (Optional) Run Database Migrations
alembic upgrade head
```

The Python backend will be available at `http://localhost:8000`

#### 2. Start Go API Gateway

```bash
cd server/go

# Download dependencies
go mod download

# Run the server
go run cmd/api/main.go
```

The Go API Gateway will be available at `http://localhost:8080`

#### 3. Start Frontend

```bash
cd client

# Install dependencies (if not already)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Option 2: Docker Compose

```bash
# Build and start all services
docker-compose up

# Or run in detached mode
docker-compose up -d
```

### Environment Variables

#### Go API Gateway

```bash
export HOST=0.0.0.0
export PORT=8080
export ENVIRONMENT=development
export JWT_SECRET=your-secret-key
export PYTHON_BACKEND_URL=http://localhost:8000
export DATABASE_URL=postgres://localhost:5432/top100ideas
export REDIS_URL=redis://localhost:6379
```

#### Python Backend

```bash
export HOST=0.0.0.0
export PORT=8000
export ENVIRONMENT=development
export DATABASE_URL=postgresql://localhost:5432/top100ideas
export REDIS_URL=redis://localhost:6379
export OPENAI_API_KEY=your-api-key
```

## API Documentation

Once running, visit:

- **Go API Gateway**: `http://localhost:8080` (health check)
- **Python Backend**: `http://localhost:8000/docs` (Swagger UI)

### Key Endpoints

#### Authentication

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | /api/v1/auth/login    | User login        |
| POST   | /api/v1/auth/register | User registration |
| POST   | /api/v1/auth/refresh  | Refresh token     |

#### Agents

| Method | Endpoint           | Description     |
| ------ | ------------------ | --------------- |
| GET    | /api/v1/agents     | List all agents |
| POST   | /api/v1/agents     | Create agent    |
| GET    | /api/v1/agents/:id | Get agent       |
| PUT    | /api/v1/agents/:id | Update agent    |
| DELETE | /api/v1/agents/:id | Delete agent    |

#### Compliance

| Method | Endpoint                      | Description    |
| ------ | ----------------------------- | -------------- |
| GET    | /api/v1/compliance            | List checks    |
| POST   | /api/v1/compliance/check      | Run check      |
| GET    | /api/v1/compliance/categories | Get categories |

#### Deepfake

| Method | Endpoint                  | Description    |
| ------ | ------------------------- | -------------- |
| POST   | /api/v1/deepfake/analyze  | Analyze media  |
| GET    | /api/v1/deepfake/analyses | List analyses  |
| GET    | /api/v1/deepfake/stats    | Get statistics |

#### WebSocket

| Endpoint                      | Description       |
| ----------------------------- | ----------------- |
| ws://localhost:8080/api/v1/ws | Real-time updates |

## Development

### Running Tests

```bash
# Frontend tests
cd client
npm test

# Run E2E tests
npx playwright test

# Go tests
cd server/go
go test ./...

# Python tests
cd server/python
pytest
```

### Building for Production

```bash
# Frontend
cd client
npm run build

# Go
cd server/go
go build -o main ./cmd/api

# Python
cd server/python
pip install -r requirements.txt
```

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Find process using port
   lsof -i :8080  # Linux/Mac
   netstat -ano | findstr :8080  # Windows

   # Kill process
   kill -9 <PID>
   ```

2. **Dependencies not found**

   ```bash
   # Go
   go mod tidy

   # Python
   pip install -r requirements.txt --upgrade

   # Frontend
   npm install --legacy-peer-deps
   ```

3. **Database connection issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL environment variable
   - Verify network connectivity

## License

MIT License
