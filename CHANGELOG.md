# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-09

### Added

#### Patient Types Enhancement
- Support for three patient types: Single Pet, Single Livestock, and Batch Livestock
- `PatientType` enum with values: SINGLE_PET, SINGLE_LIVESTOCK, BATCH_LIVESTOCK
- New fields in Animal model: `patientType`, `batchName`, `batchSize`, `batchIdentifier`
- Batch livestock management with validation
- Patient type filtering in animal queries

#### Organization Approval Workflow
- Manual approval system for organizations by Master Admin
- `OrgStatus` enum with values: PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED
- New approval fields in Organization model: `status`, `approvedAt`, `approvedBy`, `rejectedAt`, `rejectedBy`, `rejectionReason`, `suspendedAt`, `suspendedBy`, `suspensionReason`, `reactivatedAt`, `reactivatedBy`
- Master Admin endpoints:
  - `GET /orgs/admin/pending-approvals` - List pending organizations
  - `POST /orgs/admin/:orgId/approve` - Approve organization
  - `POST /orgs/admin/:orgId/reject` - Reject organization with reason
  - `POST /orgs/admin/:orgId/suspend` - Suspend organization with reason
  - `POST /orgs/admin/:orgId/reactivate` - Reactivate suspended organization

#### Treatment Payment Tracking
- `PaymentStatus` enum with values: PAID, OWED, PARTIALLY_PAID, WAIVED
- New payment fields in TreatmentRecord model: `amount`, `currency`, `paymentStatus`, `paidAt`, `paidBy`, `amountPaid`, `paymentNotes`
- `MarkPaymentDto` for updating payment status
- `POST /orgs/:orgId/treatments/:treatmentId/payment` - Mark payment endpoint
- Support for partial payments
- Payment status filtering in treatment queries

#### Scheduled Treatments
- New scheduling fields in TreatmentRecord model: `isScheduled`, `scheduledFor`
- Ability to schedule treatments in advance
- `GET /orgs/:orgId/treatments/scheduled/list` - List scheduled treatments
- Scheduling support in CreateTreatmentDto

#### Treatment History Import
- `TreatmentHistoryDto` for historical treatment records
- `treatmentHistory` array field in CreateAnimalDto
- Bulk import of previous treatment history when adding livestock
- Transaction-based import for data integrity
- Treatment history count tracked in audit logs

#### Organization Revenue Tracking
- `GET /orgs/:orgId/revenue` - Get revenue statistics endpoint
- Revenue aggregation by payment status
- Total revenue, total paid, and total owed calculations
- Payment breakdown with counts
- Owner/Admin-only access control

### Changed
- Enhanced CreateAnimalDto with patient type and treatment history fields
- Enhanced CreateTreatmentDto with payment tracking and scheduling fields
- Updated AnimalsService to handle batch livestock and treatment history import
- Updated TreatmentsService to support payment tracking and scheduled treatments
- Updated OrganizationsService with approval workflow methods and revenue tracking
- Prisma client regenerated with new schema

### Documentation
- Added `/backend/docs/NEW_FEATURES.md` - Comprehensive feature documentation
- Added `/backend/docs/MIGRATION_GUIDE.md` - Migration instructions from v1.0 to v1.1
- Added `/backend/docs/IMPLEMENTATION_SUMMARY_V1.1.md` - Technical implementation details
- Updated `/backend/docs/README.md` - Complete API reference with v1.1 endpoints
- Updated `/backend/README.md` - Project overview with v1.1 features
- Updated `/backend/IMPLEMENTATION_STATUS.md` - Progress tracking with v1.1 additions

### Database Schema Changes
- New enums: `PatientType`, `PaymentStatus`, `OrgStatus`
- Animal model: Added 4 new fields for patient types
- Organization model: Added 10 new fields for approval workflow
- TreatmentRecord model: Added 9 new fields for payment tracking and scheduling
- New indexes for performance optimization

### Security
- Organization approval endpoints restricted to Master Admin only
- Revenue endpoint restricted to organization owners and admins
- Payment updates tracked with `paidBy` field
- All approval actions logged in audit logs

### Backward Compatibility
- Fully backward compatible with v1.0
- Existing animals default to `patientType: SINGLE_PET`
- Existing organizations default to `status: PENDING_APPROVAL`
- Existing treatments have `NULL` payment fields (optional)
- All new fields have sensible defaults

---

## [1.0.0] - 2026-02-08

### Added

#### Infrastructure
- NestJS project setup with TypeScript strict mode
- Prisma ORM integration with PostgreSQL (Supabase)
- Global exception filter
- Response interceptor for standard API envelope
- Validation pipes with class-validator
- CORS configuration
- Rate limiting with ThrottlerGuard
- Environment configuration management

#### Database Schema
- Complete Prisma schema with all core models
- Vet model with approval workflow
- Organization model with slug generation
- OrgMembership model with granular permissions
- Invitation model with token-based system
- Client model with soft delete
- Animal model with soft delete
- TreatmentRecord model with versioning and soft delete
- Notification, AuditLog, and ActivityLog models
- All enums (VetStatus, OrgType, MembershipRole, etc.)
- Proper indexes for performance
- Foreign key relationships

#### Authentication & Authorization
- JWT strategy for Supabase JWT validation
- JwtAuthGuard (global, with @Public decorator)
- ApprovalGuard (vet status verification)
- RoleGuard (OWNER/ADMIN/MEMBER)
- OrgScopeGuard (organization membership check)
- DeletePermissionGuard (granular delete permissions)
- ActivityLogPermissionGuard (activity log access)
- MasterAdminGuard (platform admin operations)
- @CurrentUser decorator
- @Roles decorator
- @SkipApproval decorator
- @RequireDeletePermission decorator

#### Core Services
- PrismaService (database connection)
- AuditLogService (platform-wide audit trail)
- ActivityLogService (organization-scoped activity feed)

#### Vets Module
- Profile completion endpoint
- Get profile endpoint
- Get approval status endpoint
- Master Admin endpoints:
  - Get pending approvals
  - Approve vet
  - Reject vet
  - Suspend vet
  - Reactivate vet
- Complete DTOs with validation
- Audit logging for all actions

#### Organizations Module
- Create organization
- Get all user organizations
- Get organization details
- Update organization (OWNER/ADMIN only)
- Get organization members
- Get activity logs (with permission check)
- Auto-create OWNER membership on org creation
- Slug generation with uniqueness
- Complete DTOs

#### Memberships & Invitations Module
- Create invitation (OWNER/ADMIN)
- Get organization invitations
- Accept invitation
- Decline invitation
- Cancel invitation
- Remove member (OWNER only)
- Update member role (OWNER only)
- Update permissions (OWNER only)
- Leave organization
- Invitation expiration (7 days)
- Vet approval verification
- OWNER protection
- All DTOs with validation

#### Clients Module
- Create client
- Get all clients (pagination, search)
- Get client details
- Update client
- Soft delete (requires permission + reason)
- Restore deleted client
- Get client's animals
- Cascade soft delete to animals and treatments
- Search by name, email, phone
- All DTOs with validation

#### Animals Module
- Register animal
- Get all animals (pagination, filters)
- Get animal details
- Update animal
- Soft delete (requires permission + reason)
- Restore deleted animal
- Record animal death
- Get treatment history
- Microchip uniqueness validation
- Cascade soft delete to treatments
- All DTOs with validation

#### Treatments Module
- Create treatment record
- Get all treatments (pagination, filters)
- Get treatment details
- Update treatment (creates new version)
- Soft delete (requires permission + reason)
- Restore deleted treatment
- Get treatment versions
- Versioning system (immutable old versions)
- Parent-child version tracking
- All DTOs with validation

### Security
- Role-based access control
- Organization-scoped data access
- Granular delete permissions
- Soft delete for data recovery
- Audit logging for all critical actions
- Activity logs per organization

[1.1.0]: https://github.com/yourusername/vet-reg/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yourusername/vet-reg/releases/tag/v1.0.0
