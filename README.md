# Modulisation Project

## Overview
This is a fullstack web application comprising a **Next.js** frontend and a **NestJS** backend. It features an integrated Keycloak setup for authentication and Postgres for database management.

### Stack:
- **Backend:** NestJS, TypeScript, TypeORM, Postgres, Tesseract.js (OCR), Nodemailer (OTP), Keycloak
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion, NextAuth (Keycloak Provider)

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- Docker & docker-compose

### 2. Environment Variables
Copy the provided `.env.example` files to `.env` in both the `frontend` and `backend` directories.
Fill out the required secrets (e.g. database credentials, Keycloak client IDs).

### 3. Run with Docker
The easiest way to stand up the entire ecosystem is via Docker:
```bash
docker-compose up -d
```
This will launch PostgreSQL, Keycloak, the NestJS Backend, and the Next.js Frontend.

### 4. Local Development
If running locally outside Docker:
- Install dependencies: `npm install` (in both `frontend` and `backend` folders)
- Run the back: `cd backend && npm run start:dev`
- Run the front: `cd frontend && npm run dev`
- **Or use VS Code Debug:** Press F5 and select "Fullstack: Debug All" in the VS Code debug pane.
