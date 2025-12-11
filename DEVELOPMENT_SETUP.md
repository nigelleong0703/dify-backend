# Dify Development Setup Guide

## Quick Start: Local Development with Middleware Docker

This is the recommended way to develop Dify - run only essential services in Docker, and API/Web locally for faster development cycles.

## Step 1: Start Middleware Services (Docker)

```bash
cd docker
cp middleware.env.example middleware.env

# Disable billing restrictions for development
echo "BILLING_ENABLED=false" >> middleware.env

# Start only essential services (6 containers)
docker compose -f docker-compose.middleware.yaml --profile postgresql --profile weaviate -p dify up -d
```

**This starts only the essential middleware:**
- PostgreSQL database
- Redis cache
- Weaviate vector database  
- Sandbox (code execution)
- Plugin daemon
- SSRF proxy

## Step 2: Setup and Start API (Local)

```bash
cd api
cp .env.example .env

# Generate secret key
openssl rand -base64 42 | sed 's/^/SECRET_KEY=/' >> .env

# Disable billing restrictions
echo "BILLING_ENABLED=false" >> .env

# Optional: Enable additional features for development
echo "ALLOW_REGISTER=true" >> .env
echo "ALLOW_CREATE_WORKSPACE=true" >> .env

# Install dependencies
uv sync --dev

# Run database migrations
uv run flask db upgrade

# Start API server
uv run flask run --host 0.0.0.0 --port=5001 --debug
```

## Step 3: Setup and Start Web Frontend (Local)

Open a new terminal:

```bash
cd web
pnpm install
pnpm dev
```

## Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5001
- **Initial setup**: http://localhost:3000/install (first time only)

## Optional: Start Background Workers

For full functionality (dataset processing, workflows, etc.), start Celery workers in additional terminals:

```bash
cd api
# Start Celery worker for background tasks
uv run celery -A app.celery worker -P threads -c 2 --loglevel INFO -Q dataset,priority_dataset,priority_pipeline,pipeline,mail,ops_trace,app_deletion,plugin,workflow_storage,conversation,workflow,schedule_poller,schedule_executor,triggered_workflow_dispatcher,trigger_refresh_executor

# Start Celery beat for scheduled tasks (in another terminal)
uv run celery -A app.celery beat
```

## Verify Services are Running

```bash
# Check Docker services
docker ps

# Should see 6 containers running:
# - dify-db_postgres-1
# - dify-redis-1  
# - dify-weaviate-1
# - dify-sandbox-1
# - dify-plugin_daemon-1
# - dify-ssrf_proxy-1
```

## Alternative: Full Docker Stack (Production-like Testing)

If you want to test the complete production-like setup with all services in Docker:

```bash
cd docker
cp .env.example .env

# Disable billing restrictions
echo "BILLING_ENABLED=false" >> .env
echo "ALLOW_REGISTER=true" >> .env
echo "ALLOW_CREATE_WORKSPACE=true" >> .env

# Start full stack (12+ containers)
docker compose --profile postgresql --profile weaviate up -d
```

**Access points:**
- Frontend: http://localhost
- API: http://localhost/api
- Setup: http://localhost/install

## Environment Variables for Development

Key environment variables to disable billing restrictions:

```bash
# Core billing control
BILLING_ENABLED=false

# Enable user registration and workspace creation
ALLOW_REGISTER=true
ALLOW_CREATE_WORKSPACE=true

# Enable additional features
DATASET_OPERATOR_ENABLED=true

# Optional: Increase file upload limits
UPLOAD_FILE_SIZE_LIMIT=100
UPLOAD_FILE_BATCH_LIMIT=20
UPLOAD_IMAGE_FILE_SIZE_LIMIT=50
```

## Prerequisites

- **Docker & Docker Compose**: For middleware services
- **Python 3.11+**: For API development
- **uv**: Python package manager (`pip install uv` or `brew install uv`)
- **Node.js 18+**: For web development
- **pnpm**: Package manager (`npm install -g pnpm`)

## Testing Billing Restriction Removal

With `BILLING_ENABLED=false`, you should be able to:
1. Create multiple workspaces
2. Add unlimited team members
3. Create unlimited applications
4. Upload larger files
5. Create unlimited datasets
6. No "upgrade plan" restrictions

## Troubleshooting

**Common Issues:**
1. **Port conflicts**: Change ports in docker-compose files if needed
2. **Permission issues**: Run `sudo chown -R $USER:$USER volumes/` in docker directory
3. **Database connection**: Ensure PostgreSQL is running and accessible
4. **Memory issues**: Increase Docker memory allocation

**Check logs:**
```bash
# Docker services
docker compose -p dify logs -f db_postgres
docker compose -p dify logs -f redis

# Local development
# API logs appear in the terminal where you ran flask
# Web logs appear in the terminal where you ran pnpm dev
```

## Next Steps

1. Use this setup for active development
2. Test billing restriction removal
3. Make code changes as needed
4. Use the analysis tool (`remove_billing_restrictions.py`) to find remaining restrictions