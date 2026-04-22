# Renault Axis - Internal Command Panel (Modulisation Project)

![Renault Axis Header](https://via.placeholder.com/800x200.png?text=Renault+Axis+Command+Panel)

## 📌 Overview

**Renault Axis** is a full-stack, enterprise-grade internal command panel designed to streamline the management of vehicle interventions, client tickets, payment histories, and automated license plate recognition (OCR).

This project replaces legacy manual data entry and disjointed systems with a unified, high-performance web application utilizing modern architectural patterns (modulisation).

## 🚀 Key Features

- **Secure Authentication (SSO):** Integrated with **Keycloak** for robust role-based access control (Admin/Mechanic/User), managed via Next-Auth on the frontend.
- **License Plate OCR:** Automatic extraction of vehicle plate numbers from images using Tesseract.js directly linked to the NestJS backend.
- **Ticket Management:** Create, track, and update intervention tickets and service demands.
- **Payment Tracking:** Monitor revenue, pending payments, and transaction history.
- **Dynamic 2-Step Workflows:** OTP verification and service selection logic built natively with React context and state.
- **Observability & Health:** Integrated **Prometheus** metrics endpoint and real-time system status indicators.
- **Animated, Responsive UI:** A highly polished, kinetic interface built with Tailwind CSS and Framer Motion, utilizing glassmorphism and bento-grid layouts.

## 🛠️ Technology Stack

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
- **OCR Engine:** Tesseract.js
- **Monitoring:** Prometheus & Grafana

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Identity & Access:** Keycloak 24
- **Gateway:** Nginx

## ⚙️ Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (v20+)

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
   - **Grafana:** http://localhost:3002

## 📂 Project Structure

```
modulisation-project/
├── apps/
│   ├── backend/              # NestJS API, Prisma Schema, OCR Logic
│   ├── frontend/             # Next.js Application
│   └── gateway/              # Nginx configuration
├── infrastructure/           # Docker Compose, Monitoring, CI/CD
├── packages/                 # Shared libraries (shared types, etc.)
└── docker-compose.yml        # (Symlink or reference to infrastructure)
```

## 🔒 Authentication Flow
1. User navigates to the app.
2. Unauthenticated users are redirected to Keycloak.
3. User signs in with their credentials.
4. Keycloak issues a JWT `accessToken`.
5. Next-Auth secures the token in a session cookies.
6. The Frontend uses `Bearer <token>` to authenticate requests to the NestJS backend API.

## 📝 License
This project is proprietary and confidential. Not for external distribution.

