# Plan: SaaS Transformation (Modulisation Project)

**Generated**: 2026-04-19
**Estimated Complexity**: High

## Overview
A complete start-to-finish rewrite and restructuring of the Renault Axis project into a production-grade SaaS platform. We will abandon the piecemeal file-editing approach and strictly adhere to a sprint-based, test-driven architecture. 

## Prerequisites
- Clean up existing corrupted files (`backend/src/` lint errors, encoding artifacts).
- Ensure Docker daemon is running.
- Tools: Node.js 20+, Docker Compose, Prisma CLI, Nest CLI.

---

## Sprint 1: Infrastructure & Developer Experience (DevOps)
**Goal**: Establish a rock-solid foundation for local development and CI/CD, preventing future setup/environment issues.
**Demo/Validation**: `docker-compose up` cleanly boots Postgres, Redis, Keycloak, and NGINX without crashing. Next/Nest environments boot via standard npm commands.

### Task 1.1: Standardize Docker & Network
- **Location**: `docker-compose.yml`, `infrastructure/nginx/nginx.conf`
- **Description**: Refine the docker-compose setup to include all required services (DB, Redis, Keycloak, NGINX). Ensure proper networking and volume persistence.
- **Validation**: Verify services are reachable internally.

### Task 1.2: Code Quality Tooling
- **Location**: `package.json`, `.eslintrc`, `.prettierrc`, `.husky`
- **Description**: Implement strict ESLint, Prettier, and Husky pre-commit hooks for both frontend and backend.
- **Validation**: Run `npm run lint` with 0 warnings.

---

## Sprint 2: Database & Data Modeling
**Goal**: Design and lock in a scalable, multi-tenant Prisma schema before touching backend logic.
**Demo/Validation**: Successful `npx prisma migrate dev` and seeding of test tenants/users.

### Task 2.1: Implement SaaS Schema
- **Location**: `backend/prisma/schema.prisma`
- **Description**: Write schema with `Tenant`, `User`, `Ticket`, `Payment`, and `OcrTask` models. Include audit fields (`createdAt`, `deletedAt`) and compound indexes.
- **Validation**: Schema compiles without errors. Prisma client generates successfully.

### Task 2.2: Seeding & Migrations
- **Location**: `backend/prisma/seed.ts`
- **Description**: Add seed scripts for default Admin, Roles, and initial Tenant.

---

## [X] Sprint 3: Backend Core & Security (NestJS)
**Goal**: Establish clean backend architecture, security guards, and caching.
**Demo/Validation**: Postman/curl requests are successfully blocked when missing a valid JWT, and validated via DTOs when present.

### Task 3.1: NestJS Core Security
- **Location**: `backend/src/main.ts`, `backend/src/core/`
- **Description**: Implement Helmet, Global Validation Pipes (whitelist/forbidNonWhitelisted), and rate limiting.
- **Validation**: Integration tests verify 400 Bad Request on invalid payloads.

### Task 3.2: Keycloak Auth Integration
- **Location**: `backend/src/auth/`
- **Description**: Configure `@nestjs/passport` with JWKS to validate Keycloak tokens. Create `JwtAuthGuard` and `RolesGuard`.

### Task 3.3: Global Redis Caching
- **Location**: `backend/src/app.module.ts`
- **Description**: Integrate `@nestjs/cache-manager` with Redis store.

---

## [X] Sprint 4: Backend Domains implementation
**Goal**: Build out the structured services/controllers using Clean Architecture.
**Demo/Validation**: Swagger UI or Postman collection validates full CRUD on Tickets/Payments.

### Task 4.1: Domain DTOs & Modules
- **Location**: `backend/src/tickets/`, `backend/src/payments/`, `backend/src/ocr/`
- **Description**: Scaffold modules, inject PrismaService. Implement business logic with multi-tenant filtering (tenantId isolation).
- **Validation**: Unit tests pass for each service (`npm run test`).

---

## Sprint 5: Frontend Architecture (Next.js)
**Goal**: Build the UI connecting securely to the backend.
**Demo/Validation**: User can log in via Keycloak, see their dashboard, and create a ticket.

### Task 5.1: NextAuth & Keycloak
- **Location**: `frontend/app/api/auth/[...nextauth]/route.ts`
- **Description**: Wire NextAuth to the Keycloak instance. Forward access tokens to the frontend session.

### Task 5.2: API Service Layer & State
- **Location**: `frontend/src/services/api.ts`
- **Description**: Create an Axios/Fetch wrapper that automatically injects the Keycloak bearer token. Handle 401 token refreshes.

### Task 5.3: UI Components & Layouts
- **Location**: `frontend/app/`, `frontend/components/`
- **Description**: Implement loading skeletons, Error Boundaries, and strict Server/Client component separation.

---

## Sprint 6: Observability & CI/CD
**Goal**: Make the system production-ready for deployment and monitoring.
**Demo/Validation**: Grafana dashboard shows API metrics; GitHub Actions pass on push.

### Task 6.1: Prometheus & Grafana
- **Location**: `docker-compose.yml`, `backend/src/metrics`
- **Description**: Add Prometheus endpoint to NestJS. Scrape via Prometheus container.

### Task 6.2: CI/CD Pipeline
- **Location**: `.github/workflows/ci.yml`
- **Description**: Create GitHub Action to lint, build Docker images, and run unit tests.

---

## Testing Strategy
- **Unit**: Jest for all NestJS services and isolated Next.js components.
- **E2E**: Cypress/Playwright for user journeys (Login -> Create Ticket).
- **Validation**: Running `npm test` across workspaces must yield >80% coverage.

## Potential Risks & Gotchas
- **Database Migrations**: Doing this locally vs production can cause state mismatches. Mitigation: establish clear `prisma migrate deploy` flow.
- **Keycloak Configuration**: SSO setups are notoriously tricky with local vs Docker bridge networks. Mitigation: use internal Docker routing but standard localhost for front-end dev.
- **Monorepo boundaries**: Keeping frontend and backend loosely coupled but type-safe. Mitigation: share Prisma-generated types if possible, or strictly type API response contracts.
