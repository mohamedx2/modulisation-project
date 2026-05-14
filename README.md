# Renault Axis - Internal Command Panel (Modulisation Project)

![Renault Axis Header](https://via.placeholder.com/800x200.png?text=Renault+Axis+Command+Panel)

## Overview

**Renault Axis** is a full-stack, enterprise-grade SaaS internal command panel for Renault after-sales management. It streamlines vehicle interventions, client tickets, payment histories, automated license plate recognition (OCR), and multi-tenant fleet management — all unified behind a single-pane-of-glass admin dashboard.

This project replaces legacy manual data entry and disjointed systems with a high-performance monorepo web application utilizing modern architectural patterns (modulisation) and a full observability stack.

## Key Features

- **Multi-Tenant SaaS Architecture:** Tenant-isolated data model (Tenant entity) with per-tenant users, tickets, vehicles, payments, and OCR tasks.
- **Secure Authentication (SSO):** Integrated with **Keycloak 24** for robust role-based access control (SUPER_ADMIN / ADMIN / MECHANIC / USER), with universal auth guards supporting both Keycloak JWT and local cookie fallback.
- **Role-Based Access Control:** Custom `UniversalRoleGuard` with automatic role enrichment from local DB into Keycloak JWT claims.
- **License Plate OCR:** Automatic extraction of Tunisian and French vehicle plate numbers from images using Tesseract.js with multi-pass strategies (rotation, binary thresholding, inversion), including VIN stitching for Renault vehicles.
- **Ticket Management:** Create, track, and update intervention tickets and service demands via real-time API with working hours validation and conflict detection.
- **Payment Tracking:** Monitor revenue, pending payments, and transaction history with CSV export.
- **Admin Dashboard:** Full CRUD for tickets, vehicles, users with role promotion, deletion, fleet management, and activity feed.
- **Dynamic 2-Step Workflows:** OTP email verification via Gmail SMTP and multi-step service selection built natively with React context and state.
- **Full Observability Stack:** Prometheus metrics (10s scrape interval), Grafana auto-provisioned dashboards, Loki log aggregation, and Promtail log shipping with real-time log viewing in the admin panel.
- **Structured Logging:** Winston-based JSON logging with in-memory buffer for live frontend display and file persistence for Promtail scraping.
- **HTTP Metrics Interceptor:** Automatic request duration histograms (bucketed) and request counter metrics for all backend endpoints.
- **Nginx Reverse Proxy:** Single entry point with SSL termination, rate limiting (10r/s API, 5r/s auth, 2r/s monitoring), and WebSocket support.
- **CI/CD Pipeline:** GitHub Actions workflow for linting (ESLint) and testing (Jest) on push/PR to main/develop.
- **E2E Testing:** Playwright-based end-to-end tests covering signup and login flows.
- **Animated, Responsive UI:** A highly polished, kinetic interface built with Tailwind CSS v4 and Framer Motion, utilizing glassmorphism and bento-grid layouts.

## Technology Stack

### Frontend (User Interface)
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 + tw-animate-css
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **UI Components:** Radix UI + shadcn/ui
- **Auth:** Next-Auth v4 (Keycloak provider)
- **Notifications:** Sonner (toast system)

### Backend (API & Services)
- **Framework:** NestJS 11
- **Database:** PostgreSQL 15
- **ORM:** Prisma 5.22 (with Keycloak introspection models)
- **Cache:** Redis 7 + `@nestjs/cache-manager`
- **OCR Engine:** Tesseract.js v7 + Sharp (image preprocessing)
- **Logging:** Winston + nest-winston + custom in-memory transport
- **Metrics:** `@willsoto/nestjs-prometheus` + `prom-client`
- **Email:** Nodemailer + `@nestjs-modules/mailer` (Gmail SMTP)
- **Validation:** class-validator + class-transformer
- **Security:** Helmet, cookie-parser, bcrypt, passport-jwt, jwks-rsa
- **Rate Limiting:** `@nestjs/throttler` (60s/1000 requests, IP-based)

### Infrastructure & Observability
- **Containerization:** Docker & Docker Compose (11 services)
- **Identity & Access:** Keycloak 24 (realm: `reno`, OIDC)
- **Reverse Proxy:** Nginx (SSL termination, rate limiting, WebSocket)
- **Metrics Collection:** Prometheus (port 9090, 10s scrape)
- **Visualization:** Grafana (port 3100) with auto-provisioned datasources & dashboard
- **Log Aggregation:** Loki (port 3101)
- **Log Shipping:** Promtail (file + Docker log scraping)

### CI & Testing
- **CI/CD:** GitHub Actions (lint + test on push/PR)
- **Unit Tests:** Jest + ts-jest (backend)
- **E2E Tests:** Playwright (frontend)

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

2. **Generate SSL Certificates (development):**
   ```bash
   cd infrastructure
   .\generate-ssl.bat  # Windows (uses Docker openssl)
   # or
   chmod +x generate-ssl.sh && ./generate-ssl.sh  # Linux/Mac
   ```

3. **Start the Full Stack (11 services):**
   ```bash
   cd infrastructure
   docker-compose up -d --build
   ```

   This starts PostgreSQL 15, Redis 7, Keycloak 24 (with pre-imported `reno` realm), NestJS backend, Next.js frontend, Prometheus, Grafana (auto-provisioned), Loki, Promtail, and Nginx reverse proxy.

4. **Access the application:**
   - **Via Nginx (HTTPS):** https://localhost
   - **Via Nginx (HTTP):** http://localhost (redirects to HTTPS)
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
│   ├── backend/                      # NestJS API, Prisma, OCR, Metrics, Logging
│   │   └── src/
│   │       ├── auth/                 # AuthController, AuthService (Keycloak + local)
│   │       │   ├── guards/           # Route-level auth guard
│   │       │   └── interfaces/       # Keycloak user interface
│   │       ├── tickets/              # Ticket CRUD + DTOs + email notifications
│   │       ├── vehicles/             # Vehicle fleet management
│   │       ├── payments/             # Payment tracking + CSV export
│   │       ├── admin/                # Admin dashboard, activity feed, role management
│   │       ├── dashboard/            # User dashboard stats & vehicle endpoints
│   │       ├── ocr/                  # Tesseract.js OCR (matricule + carte grise)
│   │       ├── otp/                  # OTP generation, send, verification
│   │       ├── prisma/               # PrismaModule, PrismaService
│   │       └── core/
│   │           ├── security/         # UniversalAuthGuard, UniversalRoleGuard, ResourceGuard
│   │           ├── metrics/          # Prometheus metrics controller + HTTP interceptor
│   │           ├── logging/          # Winston in-memory transport & console buffer
│   │           ├── logs/             # /logs endpoint for in-memory buffer
│   │           ├── filters/          # AllExceptionsFilter, WinstonExceptionFilter
│   │           └── interceptors/     # TransformInterceptor, TimeoutInterceptor
│   ├── frontend/                     # Next.js 16 Application (App Router)
│   │   └── app/
│   │       ├── adminDashboard/       # Admin panel (947 lines, 5 tabs: Overview, Reservations, Fleet, Users, Monitoring)
│   │       ├── dashboard/            # User dashboard shell
│   │       │   ├── history/          # Intervention history page
│   │       │   ├── my-rdv/           # My appointments page
│   │       │   ├── ocr/              # OCR scan page
│   │       │   ├── paiment/          # Payment history page
│   │       │   ├── tickets/          # Multi-step RDV booking (service → vehicle → date)
│   │       │   └── vehicles/add/     # Add vehicle form
│   │       ├── login/                # Login with role-based redirect
│   │       ├── signup/               # 3-step registration form
│   │       └── verify-rdv/[id]/      # RDV verification page
│   └── gateway/                      # (reserved for future API gateway)
│       ├── config/                   # (empty)
│       └── nginx/                    # (empty)
├── infrastructure/                   # Docker Compose, monitoring, reverse proxy
│   ├── docker-compose.yml            # 11 services
│   ├── docker/                       # Dockerfiles (backend + frontend)
│   ├── nginx/                        # nginx.conf + SSL certs (self-signed)
│   ├── keycloak-realm.json           # Pre-seeded realm config (realm: reno)
│   ├── prometheus/                   # prometheus.yml (10s scrape)
│   ├── grafana/provisioning/         # Auto-provisioned datasources & dashboards
│   ├── promtail/                     # Log shipping config
│   ├── generate-ssl.bat              # SSL cert generator (Windows)
│   └── setup-keycloak-admin.ps1      # Keycloak admin setup script
├── docs/                             # Architecture, auth-flow, deployment docs + diagrams
├── tests/                            # E2E tests (Playwright)
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   └── login.spec.ts
│   └── playwright.config.ts
├── .github/workflows/                # CI/CD pipeline (lint + test)
└── packages/                         # (reserved for shared libraries)
```

## API Endpoints

### Public / Unauthenticated

| Method | Path                 | Description                                                               |
| ------ | -------------------- | ------------------------------------------------------------------------- |
| GET    | `/metrics`           | Prometheus metrics (raw)                                                  |
| GET    | `/metrics/summary`   | JSON metrics summary (avg response time, error rate, memory, CPU, uptime) |
| GET    | `/logs`              | Application logs (last 500 entries from Winston in-memory buffer)         |
| POST   | `/auth/signup`       | User registration (Keycloak + local DB)                                   |
| POST   | `/auth/signup-admin` | Admin registration                                                        |
| POST   | `/auth/login`        | Login (Keycloak JWT with local fallback)                                  |
| GET    | `/auth/session`      | Current session info                                                      |

### Protected — Any Authenticated User

| Method | Path                   | Description                                              |
| ------ | ---------------------- | -------------------------------------------------------- |
| GET    | `/dashboard/stats`     | User dashboard statistics                                |
| GET    | `/dashboard/vehicles`  | User's vehicles                                          |
| POST   | `/tickets`             | Create a new intervention ticket                         |
| GET    | `/tickets`             | List user's tickets                                      |
| GET    | `/tickets/:id`         | Get ticket details                                       |
| POST   | `/vehicles`            | Add a new vehicle                                        |
| GET    | `/vehicles`            | List user's vehicles                                     |
| GET    | `/vehicles/:id`        | Get vehicle details                                      |
| POST   | `/vehicles/upload/:id` | Upload vehicle image                                     |
| GET    | `/payments`            | List user's payments                                     |
| GET    | `/payments/export`     | Export payments as CSV                                   |
| POST   | `/ocr/matricule`       | Extract license plate from image (Tunisian + French)     |
| POST   | `/ocr/carte-grise`     | Extract vehicle registration details                     |
| POST   | `/otp/send`            | Send OTP verification email                              |
| POST   | `/otp/verify`          | Verify OTP code                                          |

### Protected — Admin Only

| Method | Path                        | Description                                                    |
| ------ | --------------------------- | -------------------------------------------------------------- |
| GET    | `/admin/dashboard`          | Dashboard stats (tickets, vehicles, users, revenue)            |
| GET    | `/admin/tickets`            | All tickets (cross-user)                                       |
| GET    | `/admin/vehicles`           | All vehicles (cross-user)                                      |
| GET    | `/admin/users`              | All users                                                      |
| GET    | `/admin/activity`           | Activity stream (tickets, vehicles, payments, users)           |
| PATCH  | `/admin/users/:userId/role` | Update user role                                                |

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

## Nginx Reverse Proxy

Nginx acts as the entry point for all traffic, routing requests to appropriate services with SSL termination, rate limiting, and security headers.

### SSL Setup (Windows)

```powershell
# Run from infrastructure directory
.\generate-ssl.bat
```

This generates self-signed certificates in `infrastructure/nginx/ssl/` for development. For production, replace with Let's Encrypt certificates.

### Routing Table

| Path           | Service              | Port | Description           |
| -------------- | -------------------- | ---- | --------------------- |
| `/`            | Frontend (Next.js)   | 3000 | Main application      |
| `/api/`        | Backend API (NestJS) | 3001 | REST API endpoints    |
| `/auth/`       | Keycloak             | 8080 | Authentication & SSO  |
| `/grafana/`    | Grafana              | 3100 | Monitoring dashboards |
| `/prometheus/` | Prometheus           | 9090 | Metrics collection    |
| `/loki/`       | Loki                 | 3101 | Log aggregation       |
| `/ws/`         | Backend WebSocket    | 3001 | Real-time features    |

### Access Points

- **HTTP**: `http://localhost` (redirects to HTTPS)
- **HTTPS**: `https://localhost`
- **Direct API**: `https://localhost/api/`
- **Keycloak Admin**: `https://localhost/auth/admin`
- **Grafana**: `https://localhost/grafana`

### Security Features

- **SSL/TLS**: TLSv1.2 and TLSv1.3 with strong ciphers
- **Rate Limiting**: API (10r/s), Auth (5r/s), Monitoring (2r/s)
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, XSS Protection
- **WebSocket Support**: Real-time connections with 24h timeout
- **Request Size Limit**: 50MB max body size

## License

This project is proprietary and confidential. Not for external distribution.
