# Plan: Admin Dashboard Implementation

**Generated**: 2026-05-03
**Estimated Complexity**: Medium

## Overview
The admin dashboard currently uses mock/hardcoded data and calls endpoints that return incomplete data structures. The backend needs admin-specific endpoints with enriched data (user joins, vehicle info), and the frontend needs field mapping, action wiring, and error handling.

## Prerequisites
- Running Docker Compose stack (KeyCloak + DB + Backend + Frontend)
- Admin user created: `admin@reno.com` / `Admin@123!`
- Prisma schema already has `Vehicle` and `Ticket` models with relations

## Sprint 1: Backend — Enhance Existing Services with Admin Data

**Goal**: Enrich ticket and vehicle query responses with user/owner data for the admin dashboard.

### Task 1.1: Enhance `tickets/tickets.service.ts` — Add user joins
- **Location**: `apps/backend/src/tickets/tickets.service.ts`
- **Description**: Modify `findAll()` to `include: { creator: true }` instead of `select`. Add new method `findAllAdmin()` that queries ALL tickets across all tenants with creator info.
- **Acceptance Criteria**:
  - `findAll()` returns tickets with `creator: { id, name, email, role }`
  - `findAllAdmin()` returns all tickets with creator info (no tenant filter)
- **Validation**: Call `GET /tickets` with admin token, verify response includes `creator` object

### Task 1.2: Add `findAllAdmin` route to `tickets/tickets.controller.ts`
- **Location**: `apps/backend/src/tickets/tickets.controller.ts`
- **Description**: Add `@Get('admin')` endpoint with `@Roles({ roles: ['realm:admin', 'realm:SUPER_ADMIN'] })`. Add `@Get(':id')` detail endpoint that includes creator.
- **Acceptance Criteria**:
  - `GET /tickets/admin` returns all tickets with creator info
  - Requires admin role, returns 403 for regular users
- **Validation**: Test with admin vs regular user tokens

### Task 1.3: Enhance `vehicles/vehicles.service.ts` — Add owner joins
- **Location**: `apps/backend/src/vehicles/vehicles.service.ts`
- **Description**: Modify `findAll()` to include tenant info. Add `findAllAdmin()` method that returns all vehicles across tenants with tenant name.
- **Acceptance Criteria**:
  - `findAll()` includes vehicle + basic tenant reference
  - `findAllAdmin()` returns all vehicles with tenant info
- **Validation**: Call `GET /vehicles`, verify `tenantName` field present

### Task 1.4: Add vehicle CRUD endpoints to `vehicles/vehicles.controller.ts`
- **Location**: `apps/backend/src/vehicles/vehicles.controller.ts`
- **Description**: 
  - Add `@Get('admin')` — admin-only, returns all vehicles
  - Add `@Delete(':id')` — admin-only, soft-deletes vehicle
  - Add `@Patch(':id')` — admin-only, updates vehicle fields
- **Acceptance Criteria**:
  - `DELETE /vehicles/:id` soft-deletes (sets `deletedAt`)
  - `PATCH /vehicles/:id` updates name/plate/health/lastService
  - Both require admin role
- **Validation**: Create vehicle, patch it, delete it, verify DB state

## Sprint 2: Backend — Admin-Only Endpoints

**Goal**: Create dedicated admin endpoints for system-wide stats and user management.

### Task 2.1: Add admin endpoints to `dashboard/dashboard.controller.ts`
- **Location**: `apps/backend/src/dashboard/dashboard.controller.ts`
- **Description**: 
  - Add `@Get('admin/stats')` — returns cross-tenant stats (total users, total tickets, total vehicles, payments)
  - Add `@Get('admin/tickets')` — all tickets with creator (reuse from Sprint 1)
  - Add `@Get('admin/vehicles')` — all vehicles (reuse from Sprint 1)
  - Add `@Patch('tickets/:id/status')` — admin updates ticket status
- **Acceptance Criteria**:
  - `GET /dashboard/admin/stats` returns `{ users, tickets, vehicles, payments, uptime }`
  - `PATCH /dashboard/tickets/:id/status` updates ticket status (OPEN/PENDING/CLOSED)
- **Validation**: Call stats endpoint, verify numbers match DB counts

### Task 2.2: Add user management to `dashboard/dashboard.controller.ts`
- **Location**: `apps/backend/src/dashboard/dashboard.service.ts` + controller
- **Description**:
  - Add `@Get('admin/users')` — list all users with role counts
  - Add `@Patch('admin/users/:id/role')` — change user role
  - Add `@Delete('admin/users/:id')` — soft-delete user
- **Acceptance Criteria**:
  - `GET /dashboard/admin/users` returns array of users with `{ id, name, email, role, createdAt }`
  - `PATCH /dashboard/admin/users/:id/role` with `{ role: 'ADMIN' }` updates role
  - All require admin role
- **Validation**: List users, change a user's role, verify in DB

### Task 2.3: Register AdminModule or add to existing modules
- **Location**: `apps/backend/src/app.module.ts`
- **Description**: Ensure new endpoints are properly imported. If using existing `DashboardModule`, no changes needed. Otherwise create `AdminModule`.
- **Acceptance Criteria**: Backend starts without errors, all routes registered
- **Validation**: `docker compose logs backend` shows no errors on startup

## Sprint 3: Frontend — Wire Admin Dashboard to Real Data

**Goal**: Connect the admin dashboard UI to the real backend APIs with proper field mapping, loading states, and error handling.

### Task 3.1: Add API helper functions
- **Location**: `apps/frontend/lib/api.ts` or create `apps/frontend/lib/admin-api.ts`
- **Description**: Add typed helper functions for admin endpoints:
  - `getAdminStats()` → `GET /dashboard/admin/stats`
  - `getAllTickets()` → `GET /dashboard/admin/tickets`
  - `getAllVehicles()` → `GET /dashboard/admin/vehicles`
  - `updateTicketStatus(id, status)` → `PATCH /dashboard/tickets/:id/status`
  - `deleteTicket(id)` → `DELETE /tickets/:id`
  - `deleteVehicle(id)` → `DELETE /vehicles/:id`
  - `getAllUsers()` → `GET /dashboard/admin/users`
  - `updateUserRole(id, role)` → `PATCH /dashboard/admin/users/:id/role`
- **Acceptance Criteria**: All functions return parsed JSON or throw on error
- **Validation**: Import in dashboard page, verify types compile

### Task 3.2: Update `adminDashboard/page.tsx` — Data mapping and state
- **Location**: `apps/frontend/app/adminDashboard/page.tsx`
- **Description**:
  - Replace `fetchWithAuth("/tickets")` with `getAllTickets()`
  - Replace `fetchWithAuth("/vehicles")` with `getAllVehicles()`
  - Add state for stats, users, loading, errors
  - Map ticket fields: `ticket.creator.name` → `res.user?.name`, `ticket.scheduledAt` → `date`/`time`
  - Map vehicle fields: vehicle already has `name`, `plate`, add `tenantName`
  - Add error state display
  - Add `loadAdminStats()` on overview tab
- **Acceptance Criteria**:
  - Overview tab shows real ticket count, vehicle count, and stats
  - Reservations tab shows tickets with real user names, dates, statuses
  - Fleet tab shows vehicles with real data
  - No console errors from undefined fields
- **Validation**: Navigate to admin dashboard, verify data loads from backend

### Task 3.3: Wire up action buttons
- **Location**: `apps/frontend/app/adminDashboard/page.tsx`
- **Description**:
  - Reservation delete button → `deleteTicket(id)` → reload data
  - Reservation status badge → toggle between OPEN/PENDING/CLOSED
  - Vehicle delete button → `deleteVehicle(id)` → reload data
  - "Add New Vehicle" button → show modal/form → `POST /vehicles`
  - Management Tools → open KeyCloak admin console, Prisma Studio links
- **Acceptance Criteria**:
  - Clicking delete removes item from list after confirmation
  - Status toggle updates immediately
  - Add vehicle form creates new vehicle and adds to grid
- **Validation**: Test each action, verify backend updates and UI reflects changes

### Task 3.4: Add role-based rendering
- **Location**: `apps/frontend/app/adminDashboard/page.tsx` + `apps/frontend/app/providers.tsx`
- **Description**: 
  - Ensure `useAuth()` returns `user.role` for admin check
  - Add guard: if `user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'`, redirect to `/dashboard`
  - Use `NEXT_PUBLIC_KEYCLOAK_URL` for external tool links
- **Acceptance Criteria**:
  - Non-admin users redirected from `/adminDashboard`
  - Admin tools links work correctly
- **Validation**: Login as regular user, try accessing `/adminDashboard`, verify redirect

## Testing Strategy

### Backend Testing
- Unit test `findAllAdmin()` returns correct data across tenants
- Integration test admin endpoints return 403 for non-admin users
- Test vehicle CRUD: create → update → delete → verify soft-delete

### Frontend Testing
- Manual test: login as admin, verify all 4 tabs load data
- Test error handling: stop backend, verify error states shown
- Test action buttons: delete ticket, change status, add vehicle
- Test role guard: login as non-admin, verify redirect

### End-to-End
1. `docker compose down -v && docker compose up --build`
2. Wait for all services healthy
3. Login as `admin@reno.com` / `Admin@123!`
4. Navigate to `/adminDashboard`
5. Verify all tabs show real data
6. Test CRUD actions
7. Verify data persists after page reload

## Potential Risks & Gotchas

1. **KeyCloak roles not in local user** — The `UniversalAuthGuard` maps local DB roles to `realm_access.roles`. If admin user logs in via KeyCloak, ensure KeyCloak realm roles are passed through. The login flow already maps roles in `auth.service.ts:mapKeycloakRolesToRole()`.

2. **`ticket.scheduledAt` is null** — Many tickets may not have scheduled dates. The UI shows `new Date(res.date).toLocaleDateString()` — need null check: `res.scheduledAt ? new Date(...).toLocaleDateString() : 'N/A'`.

3. **CORS for external tool links** — KeyCloak admin console and Prisma Studio are different ports. Use direct `<a href>` links, not fetch calls.

4. **Vehicle `owner` field** — The `Vehicle` model has no direct `owner` relation (only `tenantId`). The UI shows `veh.owner?.name` but this doesn't exist. Either add a `userId` field to Vehicle or show tenant info instead.

5. **Role matching is case-sensitive** — KeyCloak roles (`admin`, `SUPER_ADMIN`) vs Prisma enum (`ADMIN`, `SUPER_ADMIN`). The `mapKeycloakRolesToRole()` helper handles this, but `@Roles` decorators use `realm:admin` format. Verify the role guard matches correctly.

## Rollback Plan

- If backend changes break existing endpoints, revert the service modifications — the `findAll()` method can keep its original `select` for backward compatibility and use separate `findAllAdmin()` for admin view.
- If frontend breaks, revert `adminDashboard/page.tsx` — the existing mock data will still display.
- No database migrations needed, so DB rollback is not required.
