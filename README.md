# Renault Axis - Internal Command Panel (Modulisation Project)

![Renault Axis Header](https://via.placeholder.com/800x200.png?text=Renault+Axis+Command+Panel)

## Overview

**Renault Axis** is a full-stack, enterprise-grade internal command panel designed to streamline the management of vehicle interventions, client tickets, payment histories, and automated license plate recognition (OCR).

This project replaces legacy manual data entry and disjointed systems with a unified, high-performance web application utilizing modern architectural patterns (modulisation).

## Key Features

- **Secure Authentication (SSO):** Integrated with **Keycloak** for robust role-based access control (Admin/Mechanic/User), with universal auth guards supporting both Keycloak JWT and local cookie fallback.
- **Role-Based Access Control:** Custom `UniversalRoleGuard` with automatic role enrichment from local DB into Keycloak JWT claims.
- **License Plate OCR:** Automatic extraction of vehicle plate numbers from images using Tesseract.js directly linked to the NestJS backend.
- **Ticket Management:** Create, track, and update intervention tickets and service demands via real-time API.
- **Payment Tracking:** Monitor revenue, pending payments, and transaction history.
- **Admin Dashboard:** Full CRUD for tickets, vehicles, users with role promotion, deletion, and fleet management.
- **Dynamic 2-Step Workflows:** OTP verification and service selection logic built natively with React context and state.
- **Full Observability Stack:** Prometheus metrics, Grafana dashboards, Loki log aggregation, and Promtail log shipping with real-time log viewing in the admin panel.
- **Structured Logging:** Winston-based JSON logging with in-memory buffer for live frontend display and file persistence for Promtail scraping.
- **HTTP Metrics Interceptor:** Automatic request duration histograms and request counter metrics for all backend endpoints.
- **Animated, Responsive UI:** A highly polished, kinetic interface built with Tailwind CSS and Framer Motion, utilizing glassmorphism and bento-grid layouts.

## Technology Stack

### Frontend (User Interface)
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Auth:** Next-Auth v4

### Backend (API & Services)
- **Framework:** NestJS 11
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Cache:** Redis 7
- **OCR Engine:** Tesseract.js
- **Logging:** Winston + nest-winston
- **Metrics:** `@willsoto/nestjs-prometheus` + `prom-client`

### Infrastructure & Observability
- **Containerization:** Docker & Docker Compose
- **Identity & Access:** Keycloak 24
- **Gateway:** Nginx
- **Metrics Collection:** Prometheus (port 9090)
- **Visualization:** Grafana (port 3100) with auto-provisioned dashboards
- **Log Aggregation:** Loki (port 3101)
- **Log Shipping:** Promtail

## Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (v22+)

### Quick Start (Docker)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohamedx2/modulisation-project.git
   cd modulisation-project
   ```

2. **Start the Infrastructure:**
   ```bash
   cd infrastructure
   docker-compose up -d --build
   ```

3. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:3001
   - **Keycloak Admin:** http://localhost:8080
   - **Prometheus:** http://localhost:9090
   - **Grafana:** http://localhost:3100 (admin / admin)
   - **Loki:** http://localhost:3101

### Local Development

```bash
# Backend
cd apps/backend
npm install
npm run start:dev

# Frontend
cd apps/frontend
npm install
npm run dev
```

## Project Structure

```
modulisation-project/
├── apps/
│   ├── backend/              # NestJS API, Prisma Schema, OCR Logic, Metrics, Logging
│   │   └── src/
│   │       ├── auth/         # Authentication, signup, role management
│   │       ├── tickets/      # Ticket CRUD
│   │       ├── vehicles/     # Vehicle fleet management
│   │       ├── payments/     # Payment tracking
│   │       ├── admin/        # Admin dashboard endpoints (activity, user roles)
│   │       ├── dashboard/    # User dashboard endpoints
│   │       └── core/
│   │           ├── security/ # UniversalAuthGuard, RoleGuard, ResourceGuard
│   │           ├── metrics/  # Prometheus metrics controller & HTTP interceptor
│   │           ├── logging/  # Winston in-memory transport & console buffer
│   │           ├── logs/     # Log retrieval endpoint
│   │           ├── filters/  # Winston-based exception filter
│   │           └── interceptors/  # Transform, timeout, metrics
│   └── frontend/             # Next.js Application
│       └── app/
│           ├── adminDashboard/  # Admin panel (tickets, fleet, users, monitoring)
│           ├── dashboard/       # User dashboard
│           └── login/           # Login page
├── infrastructure/           # Docker Compose, Monitoring configs
│   ├── docker-compose.yml
│   ├── prometheus/           # Prometheus scrape config
│   ├── grafana/              # Auto-provisioned datasources & dashboards
│   ├── promtail/             # Log shipping config
│   ├── docker/               # Dockerfiles
│   └── nginx/                # Reverse proxy config
└── packages/                 # Shared libraries
```

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/metrics` | Prometheus metrics (raw) |
| GET | `/metrics/summary` | JSON metrics summary (avg response time, error rate, memory, CPU, uptime) |
| GET | `/logs` | Application logs (last 500 entries from Winston buffer) |
| POST | `/auth/signup` | User registration |
| POST | `/auth/signup-admin` | Admin registration |
| POST | `/auth/login` | Login |

### Protected (Requires Admin Role)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Dashboard stats (tickets, vehicles, users, revenue) |
| GET | `/admin/tickets` | All tickets |
| GET | `/admin/vehicles` | All vehicles |
| GET | `/admin/users` | All users |
| GET | `/admin/activity` | Real-time activity stream (tickets, vehicles, payments, users) |
| PATCH | `/admin/users/:userId/role` | Update user role |

## Monitoring Architecture

```
Backend (NestJS)
  ├── Winston Logger ──→ File (logs/backend.log) ──→ Promtail ──→ Loki
  ├── Winston Logger ──→ In-Memory Buffer ──→ /logs endpoint ──→ Admin Dashboard
  ├── HTTP Metrics Interceptor ──→ Prometheus Registry ──→ /metrics endpoint
  └── Default Process Metrics ──→ Prometheus Registry

Prometheus ──→ Grafana (auto-provisioned dashboards)
Loki ──→ Grafana (log panel in monitoring tab)
```

### Admin Dashboard Monitoring Tab

Displays real-time data from:
- **Latency chart** — HTTP request duration histogram from Prometheus, updated every 10s
- **Memory gauge** — Node.js heap usage visualization
- **System stats** — CPU usage, error rate, uptime, total requests, Node version
- **Live logs** — Streamed from Winston in-memory buffer with level filters (All / Error / Warn / Info)
- **Service status** — Prometheus (9090), Grafana (3100), Loki (3101), Backend (3001)

## Authentication Flow

1. User navigates to the app.
2. Unauthenticated users are redirected to Keycloak.
3. User signs in with their credentials.
4. Keycloak issues a JWT `accessToken`.
5. Next-Auth secures the token in session cookies.
6. The Frontend uses `Bearer <token>` to authenticate requests to the NestJS backend API.
7. `UniversalAuthGuard` checks Keycloak JWT first, falls back to local cookie, enriches with DB roles.
8. `UniversalRoleGuard` matches roles against `@Roles()` decorator with `@Unprotected()` bypass for public routes.

## License

This project is proprietary and confidential. Not for external distribution.
