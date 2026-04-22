# System Architecture

The Renault Axis application leverages a modern, containerized, microservices-style monorepo structure.

## Monorepo Layout

- pps/frontend/: Next.js 14+ (App Router) containing the user interface, dashboards, and Framer Motion interactive journeys.
- pps/backend/: NestJS application powered by TypeScript, Prisma, and Redis.
- infrastructure/: Defines the deployment environment via Docker Compose and custom Dockerfiles.

## Data Flow

1. **Ingress (Nginx)**: All external traffic hits Nginx on port 80. Nginx routes /api requests to the Backend and all other requests to the Frontend.
2. **Frontend UI**: Renders server-side or client-side Next.js components. Interacts with the backend REST/GraphQL endpoints.
3. **Backend Logic (NestJS)**: 
   - Processes OCR and administrative tasks.
   - Integrates with **Redis** for rate limiting (Throttler) and caching (cache-manager).
   - Validates JWTs against **Keycloak**.
4. **Data Persistence**: **PostgreSQL** holds both business domain data (managed via Prisma) and identity data (managed via Keycloak).

## Observability

- **Prometheus** continuously scrapes metrics from the NestJS application (e.g., HTTP request durations, memory usage).
- **Grafana** consumes Prometheus data to provide rich, visual dashboards for real-time monitoring of System Health.