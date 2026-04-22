# Authentication Flow

Renault Axis uses **Keycloak** as the Identity and Access Management (IAM) provider, ensuring robust, SSO-ready, and secure authentication across the frontend and backend.

## Overview

We use an OAuth2.0 / OpenID Connect (OIDC) flow to authenticate users. The Next.js frontend acts as the client, redirecting users to the Keycloak login portal (or using direct API grants if configured), handling the token retrieval, and passing JWT Access Tokens to the NestJS backend.

## Step-by-Step Flow

1. **User Login**: 
   - Unauthenticated user navigates to /login.
   - User inputs credentials or clicks Single Sign-On (SSO).
2. **Keycloak Authentication**: 
   - Credentials are submitted securely to the Keycloak server (http://keycloak:8080).
   - Keycloak validates the user against the internal Postgres database (enault_db).
3. **Token Issuance**:
   - Upon success, Keycloak issues a JWT ccess_token and a efresh_token.
   - The frontend stores these securely (typically in HTTP-only cookies or secure session storage).
4. **API Requests**:
   - The frontend includes the JWT in the Authorization: Bearer <token> header for all requests to the NestJS backend (http://backend:3001 or via Nginx).
5. **Backend Validation**:
   - NestJS receives the request and extracts the JWT.
   - Using Auth Guards, NestJS validates the token signature via the Keycloak public key (JWKS) and checks roles/permissions.
   - If valid, the request proceeds. If invalid or expired, a 401 Unauthorized is returned.

## Role-Based Access Control (RBAC)

Keycloak injects role claims inside the JWT. NestJS restricts certain endpoints using @Roles('admin') decorators so only permitted users can perform sensitive OCR or billing modifications.
