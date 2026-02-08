# Backend Tasks — Veterinary Registration & Practice Management Platform

**Technology Stack:** NestJS, TypeScript, Prisma, PostgreSQL (Supabase), Resend/SendGrid, Twilio
**Total Tasks:** ~130

Legend: `[ ]` = To do | `[x]` = Done | Priority: `P0` = Must have | `P1` = Should have | `P2` = Nice to have

---

## Epic 1: Backend Infrastructure Setup

- [ ] **1.1** Initialize NestJS backend project with TypeScript strict mode `P0`
- [ ] **1.2** Configure ESLint + Prettier for backend `P0`
- [ ] **1.3** Set up environment variable management (.env files, .env.example template) `P0`
- [ ] **1.4** Set up Prisma ORM, connect to Supabase Postgres `P0`
- [ ] **1.5** Configure Sentry for backend error tracking `P1`
- [ ] **1.6** Configure Resend (or SendGrid) account for transactional email `P1`
- [ ] **1.7** Configure Twilio (or Africa's Talking) account for SMS `P1`
- [ ] **1.8** Set up Railway or Render hosting for staging environment `P1`

---

## Epic 2: Database Schema & Migrations

- [ ] **2.1** Write complete Prisma schema with all models: Vet, Organization, OrgMembership, Invitation, Client, Animal, TreatmentRecord, Notification, AuditLog, ActivityLog `P0`
- [ ] **2.2** Define all enums: VetStatus, OrgType, MembershipRole, MembershipStatus, InvitationStatus, AnimalSpecies, AnimalGender, WeightUnit, TemperatureUnit, TreatmentStatus, NotificationType, NotificationChannel, DeliveryStatus, Gender, PracticeType `P0`
- [ ] **2.3** Add all indexes as defined in PRD Section 20.3 `P0`
- [ ] **2.4** Add soft-delete fields (isDeleted, deletedAt, deletedBy, deletionReason) to Client, Animal, TreatmentRecord models `P0`
- [ ] **2.5** Add granular permission fields (canDeleteClients, canDeleteAnimals, canDeleteTreatments, canViewActivityLog) to OrgMembership model `P0`
- [ ] **2.6** Run initial Prisma migration and verify schema in Supabase `P0`
- [ ] **2.7** Write and apply Supabase RLS policies for: vets, organizations, org_memberships, clients, animals, treatment_records, activity_logs, audit_logs (see PRD Section 22) `P0`
- [ ] **2.8** Seed Master Admin user(s) into the database `P0`
- [ ] **2.9** Verify RLS policies with direct SQL queries (test cross-org access is blocked) `P0`

---

## Epic 3: Core Middleware, Guards & Interceptors

- [ ] **3.1** Create standard API response envelope (success/error format as per PRD Section 7.3) `P0`
- [ ] **3.2** Create global `ResponseInterceptor` to wrap all responses in the standard envelope `P0`
- [ ] **3.3** Create global `HttpExceptionFilter` to catch all errors and map to standard error response `P0`
- [ ] **3.4** Create `AuthGuard` — extract JWT from Authorization header, validate with Supabase, attach vet to request `P0`
- [ ] **3.5** Create `ApprovalGuard` — check vet.status === APPROVED; return appropriate 403 for PENDING/REJECTED/SUSPENDED `P0`
- [ ] **3.6** Create `RoleGuard` (parameterized) — check vet's role within the target organization meets minimum requirement `P0`
- [ ] **3.7** Create `OrgScopeGuard` — verify vet has active membership in the target org; inject orgId into request `P0`
- [ ] **3.8** Create `DeletePermissionGuard` (parameterized) — check specific permission flag (canDeleteClients/canDeleteAnimals/canDeleteTreatments) on membership `P0`
- [ ] **3.9** Create `ActivityLogPermissionGuard` — check role is OWNER or canViewActivityLog is true `P0`
- [ ] **3.10** Set up global `ValidationPipe` with class-validator (whitelist: true, transform: true) `P0`
- [ ] **3.11** Set up CORS configuration as per PRD Section 19.2 `P0`
- [ ] **3.12** Set up rate limiting middleware (per-IP and per-user, thresholds per PRD Section 19.3) `P1`
- [ ] **3.13** Set up request logging middleware (method, path, IP, user-agent) `P1`
- [ ] **3.14** Set up Swagger/OpenAPI documentation with @nestjs/swagger `P1`
- [ ] **3.15** Write unit tests for all guards (AuthGuard, ApprovalGuard, RoleGuard, OrgScopeGuard, DeletePermissionGuard, ActivityLogPermissionGuard) `P0`

---

## Epic 4: Authentication & Vet Registration (Backend)

- [ ] **4.1** Create `AuthModule` with `AuthController` and `AuthService` `P0`
- [ ] **4.2** Implement `GET /auth/me` — return vet profile + status; create new vet record if first-time user `P0`
- [ ] **4.3** Implement `POST /auth/logout` — sign out via Supabase Admin API `P0`
- [ ] **4.4** Create `VetModule` with `VetController` and `VetService` `P0`
- [ ] **4.5** Implement `POST /vets/profile` — submit vet profile (onboarding); validate required fields, VCN uniqueness, email consistency `P0`
- [ ] **4.6** Implement `GET /vets/profile` — get own profile `P0`
- [ ] **4.7** Implement `PATCH /vets/profile` — update profile fields (restrict VCN change after approval) `P0`
- [ ] **4.8** Create all DTOs with class-validator decorators: CreateVetProfileDto, UpdateVetProfileDto `P0`
- [ ] **4.9** Write unit tests for VetService (profile creation, VCN uniqueness, edit restrictions) `P0`
- [ ] **4.10** Write integration tests for auth and vet profile endpoints `P0`

---

## Epic 5: Master Admin Dashboard (Backend)

- [ ] **5.1** Create `AdminModule` with `AdminController` and `AdminService` `P0`
- [ ] **5.2** Implement `GET /admin/vets` — list all vets with filtering by status, pagination, search `P0`
- [ ] **5.3** Implement `GET /admin/vets/:vetId` — get vet details `P0`
- [ ] **5.4** Implement `POST /admin/vets/:vetId/approve` — approve vet, set timestamps, trigger notifications `P0`
- [ ] **5.5** Implement `POST /admin/vets/:vetId/reject` — reject with required reason, trigger notifications `P0`
- [ ] **5.6** Implement `POST /admin/vets/:vetId/suspend` — suspend vet, invalidate sessions via Supabase Admin API, trigger notifications `P0`
- [ ] **5.7** Implement `POST /admin/vets/:vetId/reactivate` — reactivate suspended vet, trigger notifications `P0`
- [ ] **5.8** Implement `GET /admin/stats` — platform-wide statistics (vet counts by status, org count, client/animal/treatment totals) `P2`
- [ ] **5.9** Write unit tests for AdminService (approve, reject, suspend, reactivate logic) `P0`
- [ ] **5.10** Write integration tests for all admin endpoints `P0`

---

## Epic 6: Organization Management (Backend)

- [ ] **6.1** Create `OrganizationModule` with `OrganizationController` and `OrganizationService` `P0`
- [ ] **6.2** Implement `POST /orgs` — create org, auto-create OWNER membership, generate slug `P0`
- [ ] **6.3** Implement `GET /orgs` — list organizations the vet belongs to `P0`
- [ ] **6.4** Implement `GET /orgs/:orgId` — get org details (guarded by OrgScope) `P0`
- [ ] **6.5** Implement `PATCH /orgs/:orgId` — update org details (ADMIN+ only) `P0`
- [ ] **6.6** Implement `GET /orgs/:orgId/stats` — org-level statistics (client/animal/treatment counts) `P2`
- [ ] **6.7** Create DTOs: CreateOrganizationDto, UpdateOrganizationDto `P0`
- [ ] **6.8** Write unit tests for OrganizationService `P0`

---

## Epic 7: Organization Membership & Invitations (Backend)

- [ ] **7.1** Create `MembershipModule` with `MembershipController` and `MembershipService` `P0`
- [ ] **7.2** Create `InvitationModule` with `InvitationController` and `InvitationService` `P0`
- [ ] **7.3** Implement `POST /orgs/:orgId/invitations` — send invitation email, create pending record with token `P0`
- [ ] **7.4** Implement `GET /orgs/:orgId/invitations` — list org invitations (ADMIN+) `P0`
- [ ] **7.5** Implement `DELETE /orgs/:orgId/invitations/:id` — cancel pending invitation `P0`
- [ ] **7.6** Implement `GET /invitations/mine` — list invitations for current vet `P0`
- [ ] **7.7** Implement `POST /invitations/:token/accept` — accept invitation, create active membership `P0`
- [ ] **7.8** Implement `POST /invitations/:token/decline` — decline invitation `P0`
- [ ] **7.9** Implement `GET /orgs/:orgId/members` — list org members with roles and permission flags `P0`
- [ ] **7.10** Implement `DELETE /orgs/:orgId/members/:vetId` — remove member (ADMIN+; cannot remove OWNER) `P0`
- [ ] **7.11** Implement `POST /orgs/:orgId/leave` — leave org (OWNER cannot leave) `P0`
- [ ] **7.12** Implement `PATCH /orgs/:orgId/members/:vetId/role` — change member role (ADMIN+; cannot promote to OWNER) `P0`
- [ ] **7.13** Implement `PATCH /orgs/:orgId/members/:vetId/permissions` — grant/revoke permissions (OWNER only) `P0`
- [ ] **7.14** Implement `GET /orgs/:orgId/members/:vetId/permissions` — get member permission flags (OWNER only) `P0`
- [ ] **7.15** Create DTOs: CreateInvitationDto, ChangeRoleDto, UpdatePermissionsDto `P0`
- [ ] **7.16** Write unit tests for MembershipService and InvitationService `P0`
- [ ] **7.17** Write integration tests for all membership and invitation endpoints `P0`

---

## Epic 8: Client Management (Backend)

- [ ] **8.1** Create `ClientModule` with `ClientController` and `ClientService` `P0`
- [ ] **8.2** Implement `POST /orgs/:orgId/clients` — create client with duplicate detection `P0`
- [ ] **8.3** Implement `GET /orgs/:orgId/clients` — list clients with pagination, search, sort, filter (exclude deleted by default) `P0`
- [ ] **8.4** Implement `GET /orgs/:orgId/clients/:clientId` — get client detail with animal count `P0`
- [ ] **8.5** Implement `PATCH /orgs/:orgId/clients/:clientId` — update client `P0`
- [ ] **8.6** Implement `PATCH /orgs/:orgId/clients/:clientId/deactivate` — deactivate client (ADMIN+) `P0`
- [ ] **8.7** Implement `PATCH /orgs/:orgId/clients/:clientId/reactivate` — reactivate client (ADMIN+) `P0`
- [ ] **8.8** Implement `DELETE /orgs/:orgId/clients/:clientId` — soft-delete client with required reason; cascade to animals and treatments; requires canDeleteClients permission `P0`
- [ ] **8.9** Implement `POST /orgs/:orgId/clients/:clientId/restore` — restore soft-deleted client (ADMIN+) `P0`
- [ ] **8.10** Implement `?includeDeleted=true` query parameter support on list endpoint (ADMIN+ only) `P0`
- [ ] **8.11** Create DTOs: CreateClientDto, UpdateClientDto, DeleteClientDto (with reason) `P0`
- [ ] **8.12** Write unit tests for ClientService (CRUD, soft-delete, cascade, restore) `P0`
- [ ] **8.13** Write integration tests for all client endpoints `P0`

---

## Epic 9: Animal Management (Backend)

- [ ] **9.1** Create `AnimalModule` with `AnimalController` and `AnimalService` `P0`
- [ ] **9.2** Implement `POST /orgs/:orgId/animals` — register animal; validate clientId belongs to same org; check microchip uniqueness `P0`
- [ ] **9.3** Implement `GET /orgs/:orgId/animals` — list animals with pagination, search, sort, filter (exclude deleted by default) `P0`
- [ ] **9.4** Implement `GET /orgs/:orgId/animals/:animalId` — get animal detail with client info and treatment count `P0`
- [ ] **9.5** Implement `PATCH /orgs/:orgId/animals/:animalId` — update animal (allow client transfer within org) `P0`
- [ ] **9.6** Implement `PATCH /orgs/:orgId/animals/:animalId/deceased` — mark animal as deceased `P0`
- [ ] **9.7** Implement `GET /orgs/:orgId/clients/:clientId/animals` — list animals for a specific client `P0`
- [ ] **9.8** Implement `DELETE /orgs/:orgId/animals/:animalId` — soft-delete animal with required reason; cascade to treatments; requires canDeleteAnimals permission `P0`
- [ ] **9.9** Implement `POST /orgs/:orgId/animals/:animalId/restore` — restore soft-deleted animal (ADMIN+; fail if parent client is deleted) `P0`
- [ ] **9.10** Create DTOs: CreateAnimalDto, UpdateAnimalDto, DeceasedAnimalDto, DeleteAnimalDto `P0`
- [ ] **9.11** Write unit tests for AnimalService (CRUD, soft-delete, cascade, restore) `P0`
- [ ] **9.12** Write integration tests for all animal endpoints `P0`

---

## Epic 10: Medical Treatment Records (Backend)

- [ ] **10.1** Create `TreatmentModule` with `TreatmentController` and `TreatmentService` `P0`
- [ ] **10.2** Implement `POST /orgs/:orgId/treatments` — create treatment record; validate animalId; auto-set vetId, version 1, isLatestVersion `P0`
- [ ] **10.3** Implement `GET /orgs/:orgId/treatments` — list treatments (latest versions only by default; support ?includeAllVersions=true) with pagination, search, sort, filter `P0`
- [ ] **10.4** Implement `GET /orgs/:orgId/treatments/:treatmentId` — get treatment detail `P0`
- [ ] **10.5** Implement `PUT /orgs/:orgId/treatments/:treatmentId` — update treatment (creates new version; sets old isLatestVersion=false; new record gets new UUID, incremented version) `P0`
- [ ] **10.6** Implement `GET /orgs/:orgId/treatments/:treatmentId/history` — get all versions of a treatment ordered by version desc `P0`
- [ ] **10.7** Implement `GET /orgs/:orgId/animals/:animalId/treatments` — treatment timeline for an animal `P0`
- [ ] **10.8** Implement `DELETE /orgs/:orgId/treatments/:treatmentId` — soft-delete with required reason; delete entire version chain; requires canDeleteTreatments permission `P0`
- [ ] **10.9** Implement `POST /orgs/:orgId/treatments/:treatmentId/restore` — restore soft-deleted treatment chain (ADMIN+; fail if parent animal is deleted) `P0`
- [ ] **10.10** Create DTOs: CreateTreatmentDto, UpdateTreatmentDto, DeleteTreatmentDto `P0`
- [ ] **10.11** Write unit tests for TreatmentService (versioning logic, cascade delete, restore) `P0`
- [ ] **10.12** Write integration tests for all treatment endpoints `P0`

---

## Epic 11: File Uploads (Backend)

- [ ] **11.1** Create `UploadModule` with `UploadController` and `UploadService` `P0`
- [ ] **11.2** Implement `POST /uploads/profile-photo` — validate file type (JPEG/PNG), max 5MB, upload to Supabase Storage, return signed URL `P0`
- [ ] **11.3** Implement `POST /orgs/:orgId/uploads/org-logo` — validate file type, max 5MB, upload, return URL `P0`
- [ ] **11.4** Implement `POST /orgs/:orgId/uploads/treatment-attachment` — validate file type (JPEG/PNG/PDF), max 10MB per file, upload, return URL `P0`
- [ ] **11.5** Implement signed URL generation for private storage access (1-hour expiry) `P0`
- [ ] **11.6** Write unit tests for UploadService (file validation, storage integration) `P0`

---

## Epic 12: Notifications System (Backend)

- [ ] **12.1** Create `NotificationModule` with `NotificationService`, `EmailService`, `SmsService` `P1`
- [ ] **12.2** Set up NestJS EventEmitter for event-driven notification triggers `P1`
- [ ] **12.3** Implement EmailService — send emails via Resend/SendGrid with branded templates `P1`
- [ ] **12.4** Implement SmsService — send SMS via Twilio/Africa's Talking `P1`
- [ ] **12.5** Create email templates: vet approved, vet rejected, vet suspended, vet reactivated, invitation sent, follow-up reminder `P1`
- [ ] **12.6** Create SMS templates (max 160 chars each) `P1`
- [ ] **12.7** Implement notification record creation in DB for each notification sent `P1`
- [ ] **12.8** Implement retry logic with exponential backoff (1min, 5min, 15min) for failed deliveries `P1`
- [ ] **12.9** Implement `GET /notifications` — list notifications for current vet `P1`
- [ ] **12.10** Implement `PATCH /notifications/:id/read` — mark notification as read `P1`
- [ ] **12.11** Implement `PATCH /notifications/read-all` — mark all as read `P1`
- [ ] **12.12** Implement `GET /notifications/unread-count` — get unread count `P1`
- [ ] **12.13** Write unit tests for NotificationService (event handling, retry logic) `P1`

---

## Epic 13: Organization Activity Log (Backend)

- [ ] **13.1** Create `ActivityLogModule` with `ActivityLogService` `P0`
- [ ] **13.2** Implement `ActivityLogService.log()` — create activity log entry with human-readable description + metadata `P0`
- [ ] **13.3** Integrate ActivityLogService into all state-changing service methods: ClientService, AnimalService, TreatmentService, MembershipService, InvitationService, OrganizationService `P0`
- [ ] **13.4** Implement `GET /orgs/:orgId/activity-log` — list activity with pagination, filtering (action, entityType, vetId, date range), search on description `P0`
- [ ] **13.5** Apply ActivityLogPermissionGuard — OWNER or canViewActivityLog only `P0`
- [ ] **13.6** Write unit tests for ActivityLogService (log creation, description generation) `P0`
- [ ] **13.7** Write integration tests for activity log endpoint and permission enforcement `P0`

---

## Epic 14: Audit Logging (Backend)

- [ ] **14.1** Create `AuditLogModule` with `AuditLogService` `P0`
- [ ] **14.2** Implement `AuditLogService.log()` — create audit log entry with vetId, action, entityType, entityId, metadata, IP, user-agent `P0`
- [ ] **14.3** Create NestJS interceptor to automatically capture IP address and user-agent for audit entries `P0`
- [ ] **14.4** Integrate AuditLogService into all state-changing service methods and guards `P0`
- [ ] **14.5** Add LOGIN and LOGOUT audit events to auth flow `P0`
- [ ] **14.6** Write unit tests for AuditLogService `P0`

---

## Epic 15: Testing & Deployment (Backend)

### Integration & E2E Tests

- [ ] **15.1** Write integration test: complete signup → profile → approval flow `P1`
- [ ] **15.2** Write integration test: admin approval/rejection/suspension workflow `P1`
- [ ] **15.3** Write integration test: invitation accept/decline flow `P1`
- [ ] **15.4** Write integration test: client → animal → treatment CRUD flow `P1`
- [ ] **15.5** Write integration test: soft-delete and restore flow (with permission checks) `P1`
- [ ] **15.6** Run security tests: JWT tampering, cross-org access attempts, SQL injection via API inputs `P1`
- [ ] **15.7** Run RLS policy verification tests (direct DB queries to verify isolation) `P1`

### Deployment

- [ ] **15.8** Set up production Supabase project with Google OAuth configured `P0`
- [ ] **15.9** Set up production backend hosting (Railway or Render) with environment variables `P0`
- [ ] **15.10** Run Prisma migrations on production database `P0`
- [ ] **15.11** Apply RLS policies on production Supabase `P0`
- [ ] **15.12** Seed production Master Admin user(s) `P0`
- [ ] **15.13** Set up GitHub Actions CD pipeline: auto-deploy to staging on merge to develop `P0`
- [ ] **15.14** Verify all production environment variables and third-party service connections (Supabase, Resend, Twilio, Sentry) `P0`
- [ ] **15.15** Smoke test all critical API endpoints on production `P0`

---

## Backend Task Summary

| Epic | Tasks | P0 | P1 | P2 |
|------|-------|----|----|-----|
| 1. Infrastructure | 8 | 5 | 3 | 0 |
| 2. Database | 9 | 9 | 0 | 0 |
| 3. Core Guards | 15 | 13 | 2 | 0 |
| 4. Auth & Registration | 10 | 10 | 0 | 0 |
| 5. Master Admin | 10 | 8 | 0 | 2 |
| 6. Organizations | 8 | 6 | 0 | 2 |
| 7. Memberships | 17 | 17 | 0 | 0 |
| 8. Clients | 13 | 13 | 0 | 0 |
| 9. Animals | 12 | 12 | 0 | 0 |
| 10. Treatments | 12 | 12 | 0 | 0 |
| 11. File Uploads | 6 | 6 | 0 | 0 |
| 12. Notifications | 13 | 0 | 13 | 0 |
| 13. Activity Log | 7 | 7 | 0 | 0 |
| 14. Audit Log | 6 | 6 | 0 | 0 |
| 15. Testing & Deploy | 15 | 8 | 7 | 0 |
| **Total** | **161** | **132** | **25** | **4** |

---

## Suggested Build Order (Backend)

```
Week 1: Epics 1-3  (Infrastructure, DB, Guards)
Week 2: Epics 4-5  (Auth, Admin)
Week 3: Epics 6-7  (Orgs, Memberships)
Week 4: Epics 8-10 (Clients, Animals, Treatments)
Week 5: Epics 11-14 (Uploads, Notifications, Logging)
Week 6: Epic 15    (Testing & Deployment)
```

**Estimated:** 6 weeks for 1 backend developer working full-time
