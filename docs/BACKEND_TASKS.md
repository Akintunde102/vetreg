# Backend Tasks — Veterinary Registration & Practice Management Platform

**Technology Stack:** NestJS, TypeScript, Prisma, PostgreSQL (Supabase), Resend/SendGrid, Twilio  
**Total Tasks:** ~180 (includes v1.1)  
**Last Updated:** February 9, 2026  
**Backend Version:** 1.1.0

Legend: `[ ]` = To do | `[x]` = Done | Priority: `P0` = Must have | `P1` = Should have | `P2` = Nice to have

---

## Version 1.1 Backend Additions (Implemented)

- [x] **V1.1** Patient types: Single Pet, Single Livestock, Batch Livestock (enum + Animal fields) `P0`
- [x] **V1.1** Batch livestock fields: batchName, batchSize, batchIdentifier on Animal `P0`
- [x] **V1.1** Organization approval workflow: OrgStatus enum, approval fields, Master Admin endpoints (approve/reject/suspend/reactivate) `P0`
- [x] **V1.1** Treatment payment tracking: PaymentStatus, amount, paidAt, paidBy, MarkPaymentDto, mark payment endpoint `P0`
- [x] **V1.1** Scheduled treatments: isScheduled, scheduledFor, list scheduled endpoint `P0`
- [x] **V1.1** Treatment history import when adding livestock (treatmentHistory array in CreateAnimalDto) `P0`
- [x] **V1.1** Organization revenue: GET /orgs/:orgId/revenue (totalRevenue, totalPaid, totalOwed, paymentBreakdown) `P0`

See [backend/docs/NEW_FEATURES.md](../backend/docs/NEW_FEATURES.md) and [backend/docs/API_ENDPOINTS_V1.1.md](../backend/docs/API_ENDPOINTS_V1.1.md).

---

## Epic 1: Backend Infrastructure Setup

- [x] **1.1** Initialize NestJS backend project with TypeScript strict mode `P0`
- [x] **1.2** Configure ESLint + Prettier for backend `P0`
- [x] **1.3** Set up environment variable management (.env files, .env.example template) `P0`
- [x] **1.4** Set up Prisma ORM, connect to Supabase Postgres `P0`
- [ ] **1.5** Configure Sentry for backend error tracking `P1`
- [ ] **1.6** Configure Resend (or SendGrid) account for transactional email `P1`
- [ ] **1.7** Configure Twilio (or Africa's Talking) account for SMS `P1`
- [ ] **1.8** Set up Railway or Render hosting for staging environment `P1`

---

## Epic 2: Database Schema & Migrations

- [x] **2.1** Write complete Prisma schema with all models: Vet, Organization, OrgMembership, Invitation, Client, Animal, TreatmentRecord, Notification, AuditLog, ActivityLog `P0`
- [x] **2.2** Define all enums: VetStatus, OrgType, MembershipRole, MembershipStatus, InvitationStatus, AnimalSpecies, AnimalGender, WeightUnit, TemperatureUnit, TreatmentStatus, NotificationType, NotificationChannel, DeliveryStatus, Gender, PracticeType (+ PatientType, PaymentStatus, OrgStatus in v1.1) `P0`
- [x] **2.3** Add all indexes as defined in PRD Section 20.3 `P0`
- [x] **2.4** Add soft-delete fields (isDeleted, deletedAt, deletedBy, deletionReason) to Client, Animal, TreatmentRecord models `P0`
- [x] **2.5** Add granular permission fields (canDeleteClients, canDeleteAnimals, canDeleteTreatments, canViewActivityLog) to OrgMembership model `P0`
- [x] **2.6** Run initial Prisma migration and verify schema in Supabase `P0`
- [ ] **2.7** Write and apply Supabase RLS policies for: vets, organizations, org_memberships, clients, animals, treatment_records, activity_logs, audit_logs (see PRD Section 22) `P0`
- [ ] **2.8** Seed Master Admin user(s) into the database `P0`
- [ ] **2.9** Verify RLS policies with direct SQL queries (test cross-org access is blocked) `P0`

---

## Epic 3: Core Middleware, Guards & Interceptors

- [x] **3.1** Create standard API response envelope (success/error format as per PRD Section 7.3) `P0`
- [x] **3.2** Create global `ResponseInterceptor` to wrap all responses in the standard envelope `P0`
- [x] **3.3** Create global `HttpExceptionFilter` to catch all errors and map to standard error response `P0`
- [x] **3.4** Create `AuthGuard` — extract JWT from Authorization header, validate with Supabase, attach vet to request `P0`
- [x] **3.5** Create `ApprovalGuard` — check vet.status === APPROVED; return appropriate 403 for PENDING/REJECTED/SUSPENDED `P0`
- [x] **3.6** Create `RoleGuard` (parameterized) — check vet's role within the target organization meets minimum requirement `P0`
- [x] **3.7** Create `OrgScopeGuard` — verify vet has active membership in the target org; inject orgId into request `P0`
- [x] **3.8** Create `DeletePermissionGuard` (parameterized) — check specific permission flag (canDeleteClients/canDeleteAnimals/canDeleteTreatments) on membership `P0`
- [x] **3.9** Create `ActivityLogPermissionGuard` — check role is OWNER or canViewActivityLog is true `P0`
- [x] **3.10** Set up global `ValidationPipe` with class-validator (whitelist: true, transform: true) `P0`
- [x] **3.11** Set up CORS configuration as per PRD Section 19.2 `P0`
- [x] **3.12** Set up rate limiting middleware (per-IP and per-user, thresholds per PRD Section 19.3) `P1`
- [ ] **3.13** Set up request logging middleware (method, path, IP, user-agent) `P1`
- [ ] **3.14** Set up Swagger/OpenAPI documentation with @nestjs/swagger `P1`
- [ ] **3.15** Write unit tests for all guards (AuthGuard, ApprovalGuard, RoleGuard, OrgScopeGuard, DeletePermissionGuard, ActivityLogPermissionGuard) `P0`

---

## Epic 4: Authentication & Vet Registration (Backend)

- [x] **4.1** Create `AuthModule` with `AuthController` and `AuthService` `P0`
- [x] **4.2** Implement `GET /auth/me` — return vet profile + status; create new vet record if first-time user `P0`
- [ ] **4.3** Implement `POST /auth/logout` — sign out via Supabase Admin API `P0`
- [x] **4.4** Create `VetModule` with `VetController` and `VetService` `P0`
- [x] **4.5** Implement `POST /vets/profile/complete` — submit vet profile (onboarding); validate required fields, VCN uniqueness, email consistency `P0`
- [x] **4.6** Implement `GET /vets/profile` — get own profile `P0`
- [ ] **4.7** Implement `PATCH /vets/profile` — update profile fields (restrict VCN change after approval) `P0`
- [x] **4.8** Create all DTOs with class-validator decorators: CompleteProfileDto (CreateVetProfileDto equivalent) `P0`
- [ ] **4.9** Write unit tests for VetService (profile creation, VCN uniqueness, edit restrictions) `P0`
- [ ] **4.10** Write integration tests for auth and vet profile endpoints `P0`

---

## Epic 5: Master Admin Dashboard (Backend)

- [x] **5.1** Master Admin operations implemented via VetsModule (no separate AdminModule) `P0`
- [x] **5.2** Implement `GET /vets/pending-approvals` — list all vets pending approval `P0`
- [x] **5.3** Get vet details via `GET /vets/profile` (own) or via pending list `P0`
- [x] **5.4** Implement `POST /vets/:vetId/approve` — approve vet, set timestamps `P0`
- [x] **5.5** Implement `POST /vets/:vetId/reject` — reject with required reason `P0`
- [x] **5.6** Implement `POST /vets/:vetId/suspend` — suspend vet `P0`
- [x] **5.7** Implement `POST /vets/:vetId/reactivate` — reactivate suspended vet `P0`
- [ ] **5.8** Implement `GET /admin/stats` — platform-wide statistics (vet counts by status, org count, client/animal/treatment totals) `P2`
- [ ] **5.9** Write unit tests for AdminService (approve, reject, suspend, reactivate logic) `P0`
- [ ] **5.10** Write integration tests for all admin endpoints `P0`

---

## Epic 6: Organization Management (Backend)

- [x] **6.1** Create `OrganizationModule` with `OrganizationController` and `OrganizationService` `P0`
- [x] **6.2** Implement `POST /orgs` — create org, auto-create OWNER membership, generate slug `P0`
- [x] **6.3** Implement `GET /orgs` — list organizations the vet belongs to `P0`
- [x] **6.4** Implement `GET /orgs/:orgId` — get org details (guarded by OrgScope) `P0`
- [x] **6.5** Implement `PATCH /orgs/:orgId` — update org details (ADMIN+ only) `P0`
- [ ] **6.6** Implement `GET /orgs/:orgId/stats` — org-level statistics (client/animal/treatment counts) `P2`
- [x] **6.7** Create DTOs: CreateOrganizationDto, UpdateOrganizationDto `P0`
- [ ] **6.8** Write unit tests for OrganizationService `P0`
- [x] **6.9** (v1.1) Organization approval: GET /orgs/admin/pending-approvals, POST approve/reject/suspend/reactivate `P0`
- [x] **6.10** (v1.1) Implement `GET /orgs/:orgId/revenue` — organization revenue (totalRevenue, totalPaid, totalOwed, paymentBreakdown) `P0`

---

## Epic 7: Organization Membership & Invitations (Backend)

- [x] **7.1** Create `MembershipsModule` with `MembershipsController` and `MembershipsService` `P0`
- [x] **7.2** Invitations handled in same module `P0`
- [x] **7.3** Implement `POST /orgs/:orgId/invitations` — create pending invitation with token `P0`
- [x] **7.4** Implement `GET /orgs/:orgId/invitations` — list org invitations (ADMIN+) `P0`
- [x] **7.5** Implement cancel invitation (DELETE or decline) `P0`
- [ ] **7.6** Implement `GET /invitations/mine` — list invitations for current vet `P0`
- [x] **7.7** Implement `POST /invitations/:token/accept` — accept invitation, create active membership `P0`
- [x] **7.8** Implement `POST /invitations/:token/decline` — decline invitation `P0`
- [x] **7.9** Implement `GET /orgs/:orgId/members` — list org members with roles and permission flags `P0`
- [x] **7.10** Implement remove member (DELETE /orgs/:orgId/members/:membershipId) (OWNER) `P0`
- [x] **7.11** Implement `POST /orgs/:orgId/leave` — leave org (OWNER cannot leave) `P0`
- [x] **7.12** Implement `PATCH /orgs/:orgId/members/:membershipId/role` — change member role (OWNER) `P0`
- [x] **7.13** Implement `PATCH /orgs/:orgId/members/:membershipId/permissions` — grant/revoke permissions (OWNER only) `P0`
- [ ] **7.14** Implement `GET /orgs/:orgId/members/:vetId/permissions` — get member permission flags (OWNER only) `P0`
- [x] **7.15** Create DTOs: CreateInvitationDto, UpdateMemberRoleDto, UpdatePermissionsDto `P0`
- [ ] **7.16** Write unit tests for MembershipService and InvitationService `P0`
- [ ] **7.17** Write integration tests for all membership and invitation endpoints `P0`

---

## Epic 8: Client Management (Backend)

- [x] **8.1** Create `ClientsModule` with `ClientsController` and `ClientsService` `P0`
- [x] **8.2** Implement `POST /orgs/:orgId/clients` — create client `P0`
- [x] **8.3** Implement `GET /orgs/:orgId/clients` — list clients with pagination, search (exclude deleted by default) `P0`
- [x] **8.4** Implement `GET /orgs/:orgId/clients/:clientId` — get client detail with animal count `P0`
- [x] **8.5** Implement `PATCH /orgs/:orgId/clients/:clientId` — update client `P0`
- [ ] **8.6** Implement `PATCH /orgs/:orgId/clients/:clientId/deactivate` — deactivate client (ADMIN+) `P0`
- [ ] **8.7** Implement `PATCH /orgs/:orgId/clients/:clientId/reactivate` — reactivate client (ADMIN+) `P0`
- [x] **8.8** Implement `DELETE /orgs/:orgId/clients/:clientId` — soft-delete client with required reason; cascade; requires canDeleteClients `P0`
- [x] **8.9** Implement `POST /orgs/:orgId/clients/:clientId/restore` — restore soft-deleted client (ADMIN+) `P0`
- [x] **8.10** Implement `?includeDeleted=true` query parameter support on list endpoint `P0`
- [x] **8.11** Create DTOs: CreateClientDto, UpdateClientDto, DeleteClientDto (with reason) `P0`
- [ ] **8.12** Write unit tests for ClientService (CRUD, soft-delete, cascade, restore) `P0`
- [ ] **8.13** Write integration tests for all client endpoints `P0`

---

## Epic 9: Animal Management (Backend)

- [x] **9.1** Create `AnimalsModule` with `AnimalsController` and `AnimalsService` `P0`
- [x] **9.2** Implement `POST /orgs/:orgId/animals` — register animal; validate clientId; check microchip uniqueness; support patient types and treatment history (v1.1) `P0`
- [x] **9.3** Implement `GET /orgs/:orgId/animals` — list animals with pagination, search, filter (exclude deleted by default) `P0`
- [x] **9.4** Implement `GET /orgs/:orgId/animals/:animalId` — get animal detail with client info and treatment count `P0`
- [x] **9.5** Implement `PATCH /orgs/:orgId/animals/:animalId` — update animal `P0`
- [x] **9.6** Implement `POST /orgs/:orgId/animals/:animalId/death` — record animal death (RecordDeathDto) `P0`
- [x] **9.7** Implement `GET /orgs/:orgId/animals/:animalId/treatments` — treatment history for animal `P0`
- [x] **9.8** Implement `DELETE /orgs/:orgId/animals/:animalId` — soft-delete with reason; cascade; requires canDeleteAnimals `P0`
- [x] **9.9** Implement `POST /orgs/:orgId/animals/:animalId/restore` — restore soft-deleted animal (ADMIN+) `P0`
- [x] **9.10** Create DTOs: CreateAnimalDto (with patientType, batch fields, treatmentHistory in v1.1), UpdateAnimalDto, RecordDeathDto, DeleteAnimalDto `P0`
- [ ] **9.11** Write unit tests for AnimalService (CRUD, soft-delete, cascade, restore) `P0`
- [ ] **9.12** Write integration tests for all animal endpoints `P0`

---

## Epic 10: Medical Treatment Records (Backend)

- [x] **10.1** Create `TreatmentsModule` with `TreatmentsController` and `TreatmentsService` `P0`
- [x] **10.2** Implement `POST /orgs/:orgId/treatments` — create treatment; validate animalId; version 1; support payment & scheduling (v1.1) `P0`
- [x] **10.3** Implement `GET /orgs/:orgId/treatments` — list treatments (latest versions); pagination, filters `P0`
- [x] **10.4** Implement `GET /orgs/:orgId/treatments/:treatmentId` — get treatment detail `P0`
- [x] **10.5** Implement `PATCH /orgs/:orgId/treatments/:treatmentId` — update (creates new version) `P0`
- [x] **10.6** Implement `GET /orgs/:orgId/treatments/:treatmentId/versions` — get all versions of a treatment `P0`
- [x] **10.7** Implement `GET /orgs/:orgId/animals/:animalId/treatments` — treatment timeline for animal `P0`
- [x] **10.8** Implement `DELETE /orgs/:orgId/treatments/:treatmentId` — soft-delete with reason; requires canDeleteTreatments `P0`
- [x] **10.9** Implement `POST /orgs/:orgId/treatments/:treatmentId/restore` — restore soft-deleted treatment (ADMIN+) `P0`
- [x] **10.10** Create DTOs: CreateTreatmentDto, UpdateTreatmentDto, DeleteTreatmentDto, MarkPaymentDto (v1.1) `P0`
- [x] **10.11** (v1.1) Implement `POST /orgs/:orgId/treatments/:treatmentId/payment` — mark payment status `P0`
- [x] **10.12** (v1.1) Implement `GET /orgs/:orgId/treatments/scheduled/list` — list scheduled treatments `P0`
- [ ] **10.13** Write unit tests for TreatmentService (versioning logic, cascade delete, restore) `P0`
- [ ] **10.14** Write integration tests for all treatment endpoints `P0`

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

- [x] **13.1** ActivityLogService in common/services (used by modules) `P0`
- [x] **13.2** Implement `ActivityLogService.log()` — create activity log entry with description + metadata `P0`
- [x] **13.3** Integrate ActivityLogService into Client, Animal, Treatment, Membership, Invitation, Organization services `P0`
- [x] **13.4** Implement `GET /orgs/:orgId/activity-log` — list activity with pagination `P0`
- [x] **13.5** Apply ActivityLogPermissionGuard — OWNER or canViewActivityLog only `P0`
- [ ] **13.6** Write unit tests for ActivityLogService (log creation, description generation) `P0`
- [ ] **13.7** Write integration tests for activity log endpoint and permission enforcement `P0`

---

## Epic 14: Audit Logging (Backend)

- [x] **14.1** AuditLogService in common/services `P0`
- [x] **14.2** Implement `AuditLogService.log()` — create audit log entry with vetId, action, entityType, entityId, metadata `P0`
- [ ] **14.3** Create NestJS interceptor to automatically capture IP address and user-agent for audit entries `P0`
- [x] **14.4** Integrate AuditLogService into all state-changing service methods `P0`
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

| Epic | Tasks | Done | P0 | P1 | P2 |
|------|-------|------|----|----|-----|
| V1.1 Additions | 7 | 7 | 7 | 0 | 0 |
| 1. Infrastructure | 8 | 4 | 5 | 3 | 0 |
| 2. Database | 9 | 6 | 9 | 0 | 0 |
| 3. Core Guards | 15 | 12 | 13 | 2 | 0 |
| 4. Auth & Registration | 10 | 7 | 10 | 0 | 0 |
| 5. Master Admin | 10 | 7 | 8 | 0 | 2 |
| 6. Organizations | 10 | 9 | 8 | 0 | 2 |
| 7. Memberships | 17 | 14 | 17 | 0 | 0 |
| 8. Clients | 13 | 10 | 13 | 0 | 0 |
| 9. Animals | 12 | 10 | 12 | 0 | 0 |
| 10. Treatments | 14 | 12 | 12 | 0 | 0 |
| 11. File Uploads | 6 | 0 | 6 | 0 | 0 |
| 12. Notifications | 13 | 0 | 0 | 13 | 0 |
| 13. Activity Log | 7 | 5 | 7 | 0 | 0 |
| 14. Audit Log | 6 | 3 | 6 | 0 | 0 |
| 15. Testing & Deploy | 15 | 0 | 8 | 7 | 0 |
| **Total** | **~169** | **~102** | **132** | **25** | **4** |

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
