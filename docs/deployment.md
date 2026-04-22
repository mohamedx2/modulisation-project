# Deployment Guide

The Renault Axis project utilizes an infrastructure-as-code approach through Docker Compose to orchestrate its multi-container environment. By standardizing the environment, we ensure consistent behavior from local development to production.

## Architecture Overview

The system runs 8 interconnected containers encapsulated within a custom Docker bridge network (`saas-network`):

1. **Nginx** (Port `80`): The primary ingress reverse proxy holding routing logic for all services.
2. **Frontend** (Port `3000`): Next.js application running the React UI.
3. **Backend** (Port `3001`): NestJS API server.
4. **Keycloak** (Port `8080`): Identity and Access Management server handling SSO and user authentication.
5. **PostgreSQL** (Port `5432`): Primary relational database (`renault_db`), leveraged by both the backend and Keycloak.
6. **Redis** (Port `6379`): In-memory data store for caching and rate-limiting.
7. **Prometheus** (Port `9090`): Time-series metrics collection.
8. **Grafana** (Port `3002`): Metrics visualization dashboards.

## Prerequisites

- **Docker**: Version 20.10.x or newer
- **Docker Compose**: Version v2.x or newer

## Deployment Instructions

All infrastructure configurations are stored in the `infrastructure/` directory. 

### 1. Starting the Stack

To build and start the entire stack in detached mode:

```bash
docker-compose -f infrastructure/docker-compose.yml up -d --build
```

### 2. Stopping the Stack

To stop the containers while preserving volume data:

```bash
docker-compose -f infrastructure/docker-compose.yml down
```

To stop the containers and wipe all persistent data (use with caution):

```bash
docker-compose -f infrastructure/docker-compose.yml down -v
```

### 3. Rebuilding Individual Services

If you make changes to a specific app (e.g., the backend), you don't need to restart the entire stack. You can rebuild and restart just that service:

```bash
docker-compose -f infrastructure/docker-compose.yml up -d --build backend
```

## Volumes & Persistence

To ensure data isn't lost when containers are destroyed, we map named volumes to stateful services:
- `postgres_data`: Persists the PostgreSQL database.
- `prometheus_data`: Persists scraped metrics.
- `grafana_data`: Persists custom dashboards and Grafana settings.

## Environment Variables

### Backend Configuration
The backend requires connections to Postgres, Redis, and Keycloak. These are provided internally via Docker Compose:
- `DATABASE_URL`: Setup automatically for `renault_db`.
- `REDIS_URL`: `redis://redis:6379`
- `KEYCLOAK_URL`: `http://keycloak:8080`

### Frontend Configuration
The Next.js container relies on backend endpoint mappings:
- `NEXT_PUBLIC_DASHBOARD_API`: Internal routing address (`http://backend:3001`).
- `NEXT_PUBLIC_API_URL`: External routing address (`http://localhost:3001`).