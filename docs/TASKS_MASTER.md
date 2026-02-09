# V1 Task List — Veterinary Registration & Practice Management Platform

**Generated from:** PRD v1.1.0
**Last Updated:** February 9, 2026
**Total Epics:** 15
**Total Tasks:** ~250 (backend + frontend)

**Backend v1.1:** Patient types, organization approval, payment tracking, scheduled treatments, treatment history import, and organization revenue are implemented. See [BACKEND_TASKS.md](./BACKEND_TASKS.md) for detailed backend status and [backend/docs/NEW_FEATURES.md](../backend/docs/NEW_FEATURES.md) for v1.1 API.

Legend: `[ ]` = To do | `[x]` = Done | Priority: `P0` = Must have | `P1` = Should have | `P2` = Nice to have

---

## Epic 1: Project Scaffolding & Infrastructure Setup

> Set up repositories, tooling, CI/CD, and third-party services before writing any feature code.

- [ ] **1.1** Create GitHub repository with `main`, `develop`, and `staging` branches `P0`
- [ ] **1.2** Initialize NestJS backend project with TypeScript strict mode `P0`
- [ ] **1.3** Initialize Next.js 14+ frontend project (App Router) with TypeScript `P0`
- [ ] **1.4** Configure monorepo or separate repos (define convention) `P0`
- [ ] **1.5** Set up Tailwind CSS + shadcn/ui in frontend `P0`
- [ ] **1.6** Create Supabase project (dev environment) `P0`
- [ ] **1.7** Enable Google OAuth provider in Supabase Auth settings `P0`
- [ ] **1.8** Create Supabase Storage buckets (profile-photos, org-logos, treatment-attachments) with private access `P0`
- [ ] **1.9** Set up Prisma ORM in backend, connect to Supabase Postgres `P0`
- [ ] **1.10** Configure ESLint + Prettier for both frontend and backend `P0`
- [ ] **1.11** Set up environment variable management (.env files, .env.example templates) `P0`
- [ ] **1.12** Set up GitHub Actions CI pipeline: lint → type-check → unit test on every PR `P0`
- [ ] **1.13** Set up Sentry for backend error tracking `P1`
- [ ] **1.14** Set up Sentry for frontend error tracking `P1`
- [ ] **1.15** Configure Resend (or SendGrid) account for transactional email `P1`
- [ ] **1.16** Configure Twilio (or Africa's Talking) account for SMS `P1`
- [ ] **1.17** Set up staging environment (Supabase staging project, Vercel preview, Railway/Render staging) `P1`
- [ ] **1.18** Set up UptimeRobot or BetterUptime monitoring `P2`

---

## Epic 2: Database Schema & Migrations

> Define all database tables, enums, indexes, and RLS policies as per the PRD.

- [x] **2.1** Write Prisma schema with all models: Vet, Organization, OrgMembership, Invitation, Client, Animal, TreatmentRecord, Notification, AuditLog, ActivityLog (+ v1.1: PatientType, PaymentStatus, OrgStatus, new fields) `P0`
- [x] **2.2** Define all enums: VetStatus, OrgType, MembershipRole, MembershipStatus, InvitationStatus, AnimalSpecies, AnimalGender, WeightUnit, TemperatureUnit, TreatmentStatus, NotificationType, NotificationChannel, DeliveryStatus, Gender, PracticeType, PatientType, PaymentStatus, OrgStatus `P0`
- [ ] **2.3** Add all indexes as defined in PRD Section 20.3 `P0`
- [ ] **2.4** Add soft-delete fields (isDeleted, deletedAt, deletedBy, deletionReason) to Client, Animal, TreatmentRecord models `P0`
- [ ] **2.5** Add granular permission fields (canDeleteClients, canDeleteAnimals, canDeleteTreatments, canViewActivityLog) to OrgMembership model `P0`
- [ ] **2.6** Run initial Prisma migration and verify schema in Supabase `P0`
- [ ] **2.7** Write and apply Supabase RLS policies for: vets, organizations, org_memberships, clients, animals, treatment_records, activity_logs, audit_logs `P0`
- [ ] **2.8** Seed Master Admin user(s) into the database `P0`
- [ ] **2.9** Verify RLS policies with direct SQL queries (test cross-org access is blocked) `P0`

---

## Epic 3: Backend Core — Global Middleware, Guards, Interceptors

> Build the foundational NestJS infrastructure that every request flows through.

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

## Epic 4: Authentication & Vet Registration

> Google OAuth flow, first-time user handling, vet profile onboarding.

### Backend

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

### Frontend

- [ ] **4.11** Build Landing/Home page (`/`) `P0`
- [ ] **4.12** Build Login page (`/login`) with "Sign in with Google" button using @supabase/ssr `P0`
- [ ] **4.13** Build OAuth callback handler (`/auth/callback`) — exchange code for session, call GET /auth/me, route based on vet status `P0`
- [ ] **4.14** Build multi-step onboarding profile form (`/onboarding/profile`) — Personal info → Professional info → Practice info `P0`
- [ ] **4.15** Build "Application under review" waiting page (`/onboarding/pending`) `P0`
- [ ] **4.16** Build rejection notice page (`/account/rejected`) showing reason `P0`
- [ ] **4.17** Build suspension notice page (`/account/suspended`) showing reason `P0`
- [ ] **4.18** Implement frontend auth state management (session sync, auto-refresh, redirect on expiry) `P0`
- [ ] **4.19** Implement protected route wrapper (redirect unauthenticated users to /login with redirect param) `P0`

---

## Epic 5: Master Admin Dashboard

> Admin vet review queue, approve/reject/suspend/reactivate, platform stats.

### Backend

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

### Frontend

- [ ] **5.11** Build Master Admin layout with admin-specific navigation `P0`
- [ ] **5.12** Build vet review queue page (`/admin/vets`) with tabs: Pending, Approved, Rejected, Suspended, All `P0`
- [ ] **5.13** Build vet detail page (`/admin/vets/:id`) with Approve/Reject/Suspend action buttons `P0`
- [ ] **5.14** Build rejection reason modal (required field, min 10 chars) `P0`
- [ ] **5.15** Build suspension reason modal `P0`
- [ ] **5.16** Build platform statistics dashboard (`/admin/stats`) `P2`
- [ ] **5.17** Build admin audit log viewer (`/admin/audit-logs`) with filtering `P1`

---

## Epic 6: Organization Management

> Create, update, view organizations; organization switcher; multi-org support. **v1.1:** Organization approval by Master Admin; org revenue endpoint.

### Backend

- [x] **6.1** Create `OrganizationModule` with `OrganizationController` and `OrganizationService` `P0`
- [x] **6.2** Implement `POST /orgs` — create org, auto-create OWNER membership, generate slug `P0`
- [x] **6.3** Implement `GET /orgs` — list organizations the vet belongs to `P0`
- [x] **6.4** Implement `GET /orgs/:orgId` — get org details (guarded by OrgScope) `P0`
- [x] **6.5** Implement `PATCH /orgs/:orgId` — update org details (ADMIN+ only) `P0`
- [ ] **6.6** Implement `GET /orgs/:orgId/stats` — org-level statistics (client/animal/treatment counts) `P2`
- [x] **6.7** Create DTOs: CreateOrganizationDto, UpdateOrganizationDto `P0`
- [ ] **6.8** Write unit tests for OrganizationService `P0`
- [x] **6.9** (v1.1) Organization approval workflow + GET /orgs/:orgId/revenue `P0`

### Frontend

- [ ] **6.9** Build organization creation form (modal or page) `P0`
- [ ] **6.10** Build organization switcher in top navigation bar `P0`
- [ ] **6.11** Build organization settings page (`/dashboard/settings`) — edit name, address, contact info, logo `P0`
- [ ] **6.12** Build main dashboard page (`/dashboard`) with org-scoped stats overview `P0`

---

## Epic 7: Organization Membership & Invitations

> Invite vets, accept/decline, role management, permission management, remove/leave.

### Backend

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

### Frontend

- [ ] **7.18** Build members list page (`/dashboard/members`) with role badges and permission indicators `P0`
- [ ] **7.19** Build invite member modal (email + role selection) `P0`
- [ ] **7.20** Build invitation management page (`/dashboard/invitations`) — pending, accepted, declined `P0`
- [ ] **7.21** Build invitation accept/decline page (`/invitations/:token`) `P0`
- [ ] **7.22** Build member role change UI (dropdown on member row) `P0`
- [ ] **7.23** Build member permissions management page (`/dashboard/members/:id/permissions`) — toggle delete permissions + activity log access `P0`
- [ ] **7.24** Build remove member confirmation dialog `P0`
- [ ] **7.25** Build leave organization confirmation dialog `P0`

---

## Epic 8: Client Management

> Full CRUD for clients within an organization, including soft-delete with permission.

### Backend

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
- [ ] **8.12** Write unit tests for ClientService `P0`
- [ ] **8.13** Write integration tests for all client endpoints `P0`

### Frontend

- [ ] **8.14** Build client list page (`/dashboard/clients`) with search, filters, pagination `P0`
- [ ] **8.15** Build create client form (`/dashboard/clients/new`) `P0`
- [ ] **8.16** Build client detail page (`/dashboard/clients/:id`) showing animals list `P0`
- [ ] **8.17** Build edit client form (`/dashboard/clients/:id/edit`) `P0`
- [ ] **8.18** Build delete client confirmation dialog with required reason field `P0`
- [ ] **8.19** Build restore client UI (for admins viewing deleted clients) `P0`
- [ ] **8.20** Conditionally show/hide delete button based on user's canDeleteClients permission `P0`

---

## Epic 9: Animal Management

> Full CRUD for animals linked to clients, including soft-delete with permission. **v1.1:** Patient types (Single Pet, Single Livestock, Batch Livestock); treatment history import when adding livestock.

### Backend

- [x] **9.1** Create `AnimalsModule` with `AnimalsController` and `AnimalsService` `P0`
- [x] **9.2** Implement `POST /orgs/:orgId/animals` — register animal; validate clientId; microchip uniqueness; v1.1: patientType, batch fields, treatmentHistory `P0`
- [x] **9.3** Implement `GET /orgs/:orgId/animals` — list animals with pagination, search, filter (exclude deleted by default) `P0`
- [x] **9.4** Implement `GET /orgs/:orgId/animals/:animalId` — get animal detail with client info and treatment count `P0`
- [x] **9.5** Implement `PATCH /orgs/:orgId/animals/:animalId` — update animal `P0`
- [x] **9.6** Implement record death (e.g. PATCH/POST animals/:animalId/death) `P0`
- [x] **9.7** List animals per client via GET animals with clientId filter or GET clients/:clientId/animals `P0`
- [x] **9.8** Implement `DELETE /orgs/:orgId/animals/:animalId` — soft-delete with reason; cascade; canDeleteAnimals `P0`
- [x] **9.9** Implement `POST /orgs/:orgId/animals/:animalId/restore` — restore (ADMIN+) `P0`
- [x] **9.10** Create DTOs: CreateAnimalDto (v1.1: patientType, batchName/batchSize/batchIdentifier, treatmentHistory), UpdateAnimalDto, RecordDeathDto, DeleteAnimalDto `P0`
- [ ] **9.11** Write unit tests for AnimalService `P0`
- [ ] **9.12** Write integration tests for all animal endpoints `P0`

### Frontend

- [ ] **9.13** Build animal list page (`/dashboard/animals`) with search, filters, pagination `P0`
- [ ] **9.14** Build register animal form (`/dashboard/animals/new`) with client selector `P0`
- [ ] **9.15** Build animal detail page (`/dashboard/animals/:id`) showing treatment history timeline `P0`
- [ ] **9.16** Build edit animal form (`/dashboard/animals/:id/edit`) `P0`
- [ ] **9.17** Build mark deceased modal `P0`
- [ ] **9.18** Build delete animal confirmation dialog with required reason field `P0`
- [ ] **9.19** Build restore animal UI `P0`
- [ ] **9.20** Conditionally show/hide delete button based on user's canDeleteAnimals permission `P0`

---

## Epic 10: Medical Treatment Records

> Create, version, view, soft-delete treatment records with permission. **v1.1:** Payment tracking (amount, status, mark paid); scheduled treatments; list scheduled.

### Backend

- [x] **10.1** Create `TreatmentsModule` with `TreatmentsController` and `TreatmentsService` `P0`
- [x] **10.2** Implement `POST /orgs/:orgId/treatments` — create treatment; validate animalId; version 1; v1.1: amount, paymentStatus, isScheduled, scheduledFor `P0`
- [x] **10.3** Implement `GET /orgs/:orgId/treatments` — list treatments (latest versions); pagination, filters `P0`
- [x] **10.4** Implement `GET /orgs/:orgId/treatments/:treatmentId` — get treatment detail `P0`
- [x] **10.5** Implement `PATCH /orgs/:orgId/treatments/:treatmentId` — update (creates new version) `P0`
- [x] **10.6** Implement `GET /orgs/:orgId/treatments/:treatmentId/versions` — get all versions `P0`
- [x] **10.7** Implement `GET /orgs/:orgId/animals/:animalId/treatments` — treatment timeline for animal `P0`
- [x] **10.8** Implement `DELETE /orgs/:orgId/treatments/:treatmentId` — soft-delete with reason; canDeleteTreatments `P0`
- [x] **10.9** Implement `POST /orgs/:orgId/treatments/:treatmentId/restore` — restore (ADMIN+) `P0`
- [x] **10.10** Create DTOs: CreateTreatmentDto, UpdateTreatmentDto, DeleteTreatmentDto, MarkPaymentDto (v1.1) `P0`
- [x] **10.11** (v1.1) Implement `POST /orgs/:orgId/treatments/:treatmentId/payment` — mark payment; GET .../treatments/scheduled/list `P0`
- [ ] **10.12** Write unit tests for TreatmentService `P0`
- [ ] **10.13** Write integration tests for all treatment endpoints `P0`

### Frontend

- [ ] **10.13** Build treatment records list page (`/dashboard/treatments`) with search, filters, pagination `P0`
- [ ] **10.14** Build create treatment form (`/dashboard/treatments/new`) with animal selector, vitals fields, prescription builder `P0`
- [ ] **10.15** Build treatment detail page (`/dashboard/treatments/:id`) with version history panel `P0`
- [ ] **10.16** Build treatment version diff view (compare two versions side-by-side) `P1`
- [ ] **10.17** Build delete treatment confirmation dialog with required reason field `P0`
- [ ] **10.18** Build restore treatment UI `P0`
- [ ] **10.19** Conditionally show/hide delete button based on user's canDeleteTreatments permission `P0`

---

## Epic 11: File Uploads

> Profile photos, org logos, treatment attachments via Supabase Storage.

### Backend

- [ ] **11.1** Create `UploadModule` with `UploadController` and `UploadService` `P0`
- [ ] **11.2** Implement `POST /uploads/profile-photo` — validate file type (JPEG/PNG), max 5MB, upload to Supabase Storage, return signed URL `P0`
- [ ] **11.3** Implement `POST /orgs/:orgId/uploads/org-logo` — validate file type, max 5MB, upload, return URL `P0`
- [ ] **11.4** Implement `POST /orgs/:orgId/uploads/treatment-attachment` — validate file type (JPEG/PNG/PDF), max 10MB per file, upload, return URL `P0`
- [ ] **11.5** Implement signed URL generation for private storage access (1-hour expiry) `P0`
- [ ] **11.6** Write unit tests for UploadService `P0`

### Frontend

- [ ] **11.7** Build image upload component with preview, crop support, drag-and-drop `P1`
- [ ] **11.8** Integrate photo upload into vet profile form `P0`
- [ ] **11.9** Integrate logo upload into org settings `P0`
- [ ] **11.10** Integrate file attachment upload into treatment form (multi-file) `P0`

---

## Epic 12: Notifications System

> Email and SMS notifications for all critical workflow events.

### Backend

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
- [ ] **12.13** Write unit tests for NotificationService `P1`

### Frontend

- [ ] **12.14** Build notification bell icon in top navbar with unread count badge `P1`
- [ ] **12.15** Build notification dropdown/panel listing recent notifications `P1`
- [ ] **12.16** Implement mark-as-read on click `P1`

---

## Epic 13: Organization Activity Log

> Org-scoped chronological feed of all actions. OWNER-only by default.

### Backend

- [ ] **13.1** Create `ActivityLogModule` with `ActivityLogService` `P0`
- [ ] **13.2** Implement `ActivityLogService.log()` — create activity log entry with human-readable description + metadata `P0`
- [ ] **13.3** Integrate ActivityLogService into all state-changing service methods: ClientService, AnimalService, TreatmentService, MembershipService, InvitationService, OrganizationService `P0`
- [ ] **13.4** Implement `GET /orgs/:orgId/activity-log` — list activity with pagination, filtering (action, entityType, vetId, date range), search on description `P0`
- [ ] **13.5** Apply ActivityLogPermissionGuard — OWNER or canViewActivityLog only `P0`
- [ ] **13.6** Write unit tests for ActivityLogService `P0`
- [ ] **13.7** Write integration tests for activity log endpoint and permission enforcement `P0`

### Frontend

- [ ] **13.8** Build activity log page (`/dashboard/activity`) with chronological feed, color-coded action badges, vet avatar, relative timestamps `P0`
- [ ] **13.9** Build filter bar: action type dropdown, entity type dropdown, member dropdown, date range picker, search `P0`
- [ ] **13.10** Implement infinite scroll or pagination `P0`
- [ ] **13.11** Conditionally show/hide Activity Log in side nav based on OWNER role or canViewActivityLog permission `P0`

---

## Epic 14: Audit Logging

> Platform-wide compliance logging for all state-changing actions.

### Backend

- [ ] **14.1** Create `AuditLogModule` with `AuditLogService` `P0`
- [ ] **14.2** Implement `AuditLogService.log()` — create audit log entry with vetId, action, entityType, entityId, metadata, IP, user-agent `P0`
- [ ] **14.3** Create NestJS interceptor to automatically capture IP address and user-agent for audit entries `P0`
- [ ] **14.4** Integrate AuditLogService into all state-changing service methods and guards `P0`
- [ ] **14.5** Add LOGIN and LOGOUT audit events to auth flow `P0`
- [ ] **14.6** Write unit tests for AuditLogService `P0`

---

## Epic 15: Testing, Polish & Deployment

> End-to-end tests, UI polish, performance, and production deployment.

### Testing

- [ ] **15.1** Set up Playwright for E2E testing `P1`
- [ ] **15.2** Write E2E test: complete signup → profile → approval → org creation flow `P1`
- [ ] **15.3** Write E2E test: admin approval/rejection workflow `P1`
- [ ] **15.4** Write E2E test: invitation accept/decline flow `P1`
- [ ] **15.5** Write E2E test: client → animal → treatment CRUD flow `P1`
- [ ] **15.6** Write E2E test: soft-delete and restore flow (with permission checks) `P1`
- [ ] **15.7** Run security tests: JWT tampering, cross-org access, SQL injection via API inputs `P1`
- [ ] **15.8** Run RLS policy verification tests (direct DB queries) `P1`

### Frontend Polish

- [ ] **15.9** Implement skeleton loading states for all pages `P1`
- [ ] **15.10** Implement empty states with illustrations and CTAs for all list pages `P1`
- [ ] **15.11** Implement toast notifications for success/error on all actions `P0`
- [ ] **15.12** Implement responsive design: desktop, tablet, mobile breakpoints `P1`
- [ ] **15.13** Implement About page (`/about`) `P2`
- [ ] **15.14** Implement Privacy Policy page (`/privacy`) `P1`
- [ ] **15.15** Implement Terms of Service page (`/terms`) `P1`
- [ ] **15.16** Accessibility audit (keyboard navigation, screen reader labels, ARIA) `P2`

### Deployment

- [ ] **15.17** Set up production Supabase project with Google OAuth configured `P0`
- [ ] **15.18** Set up production backend hosting (Railway or Render) with environment variables `P0`
- [ ] **15.19** Set up production frontend hosting (Vercel) with environment variables `P0`
- [ ] **15.20** Configure production domain and HTTPS (vetreg.com) `P0`
- [ ] **15.21** Run Prisma migrations on production database `P0`
- [ ] **15.22** Apply RLS policies on production Supabase `P0`
- [ ] **15.23** Seed production Master Admin user(s) `P0`
- [ ] **15.24** Set up GitHub Actions CD pipeline: auto-deploy to staging on merge to develop; manual promote to production `P0`
- [ ] **15.25** Verify all production environment variables and third-party service connections `P0`
- [ ] **15.26** Smoke test all critical flows on production `P0`

---

## Suggested Build Order

The tasks above should be tackled in this order based on the feature dependency graph:

```
Phase 1 — Foundation (Epics 1, 2, 3)
  │  Project setup, DB schema, guards, middleware
  │  Duration: ~1 week
  │
Phase 2 — Auth & Admin (Epics 4, 5)
  │  Google OAuth, vet registration, admin approval
  │  Duration: ~1.5 weeks
  │
Phase 3 — Organizations (Epics 6, 7)
  │  Org CRUD, memberships, invitations, permissions
  │  Duration: ~1.5 weeks
  │
Phase 4 — Core Data (Epics 8, 9, 10, 11)
  │  Clients, animals, treatments, file uploads
  │  Duration: ~2 weeks
  │
Phase 5 — Logging & Notifications (Epics 12, 13, 14)
  │  Notifications, activity log, audit log
  │  Duration: ~1 week
  │
Phase 6 — Polish & Ship (Epic 15)
  │  E2E tests, UI polish, deployment
  │  Duration: ~1 week
  │
Total estimated: ~8 weeks (1 full-stack developer)
                 ~4–5 weeks (2 developers, frontend + backend)
```

---

## Task Counts Summary

**Backend:** Epics 1–10 (core + v1.1) are largely implemented; see [BACKEND_TASKS.md](./BACKEND_TASKS.md) for detailed done/todo breakdown.

| Epic | Name | Tasks | P0 | P1 | P2 |
|------|------|-------|----|----|-----|
| 1 | Project Scaffolding | 18 | 12 | 5 | 1 |
| 2 | Database Schema | 9 | 9 | 0 | 0 |
| 3 | Backend Core | 15 | 13 | 2 | 0 |
| 4 | Auth & Registration | 19 | 19 | 0 | 0 |
| 5 | Master Admin | 17 | 12 | 1 | 4 |
| 6 | Organizations | 12 | 10 | 0 | 2 |
| 7 | Memberships & Invitations | 25 | 25 | 0 | 0 |
| 8 | Client Management | 20 | 20 | 0 | 0 |
| 9 | Animal Management | 20 | 20 | 0 | 0 |
| 10 | Treatment Records | 19 | 18 | 1 | 0 |
| 11 | File Uploads | 10 | 9 | 1 | 0 |
| 12 | Notifications | 16 | 0 | 16 | 0 |
| 13 | Activity Log | 11 | 11 | 0 | 0 |
| 14 | Audit Logging | 6 | 6 | 0 | 0 |
| 15 | Testing & Deployment | 26 | 8 | 14 | 4 |
| **Total** | | **~243** | **192** | **40** | **11** |
