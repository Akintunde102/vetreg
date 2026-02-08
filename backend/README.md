# Veterinary Registration & Practice Management Platform - Backend

## Overview

This is the backend API for the Veterinary Registration & Practice Management Platform, built with NestJS, Prisma, PostgreSQL (Supabase), and TypeScript.

## Tech Stack

- **Framework**: NestJS 10+
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 7
- **Authentication**: Supabase Auth (Google OAuth) + JWT
- **Validation**: class-validator, class-transformer
- **Documentation**: Auto-generated via Swagger (planned)

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma           # Complete database schema
├── src/
│   ├── auth/                   # Authentication & authorization
│   │   ├── decorators/         # @CurrentUser, @Public, @Roles, etc.
│   │   ├── guards/             # All security guards
│   │   └── strategies/         # JWT strategy
│   ├── common/                 # Shared utilities
│   │   ├── filters/            # Exception handling
│   │   ├── interceptors/       # Response transformation
│   │   ├── interfaces/         # TypeScript interfaces
│   │   └── services/           # Audit/Activity logging
│   ├── config/                 # Configuration management
│   ├── organizations/          # Organizations module (✅ Complete)
│   ├── prisma/                 # Prisma service
│   ├── vets/                   # Vets module (✅ Complete)
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry point
└── test/                       # E2E tests

```

## Implemented Features

### ✅ Infrastructure (Complete)
- [x] NestJS project setup
- [x] TypeScript strict mode configuration
- [x] Prisma ORM integration
- [x] Environment configuration
- [x] Global exception filter
- [x] Response interceptor (standard envelope)
- [x] Validation pipes
- [x] CORS configuration
- [x] Rate limiting (ThrottleGuard)

### ✅ Database Schema (Complete)
- [x] Complete Prisma schema with all models:
  - Vets (with approval workflow)
  - Organizations
  - OrgMemberships (with granular permissions)
  - Invitations
  - Clients (with soft delete)
  - Animals (with soft delete)
  - TreatmentRecords (with versioning & soft delete)
  - Notifications
  - AuditLogs
  - ActivityLogs
- [x] All enums defined
- [x] Proper indexes for performance
- [x] Foreign key relationships

### ✅ Authentication & Authorization (Complete)
- [x] JWT Strategy (Supabase JWT validation)
- [x] JwtAuthGuard (global, with @Public decorator)
- [x] ApprovalGuard (vet status verification)
- [x] RoleGuard (OWNER/ADMIN/MEMBER)
- [x] OrgScopeGuard (organization membership check)
- [x] DeletePermissionGuard (granular delete permissions)
- [x] ActivityLogPermissionGuard (activity log access)
- [x] MasterAdminGuard (platform admin operations)

### ✅ Core Services (Complete)
- [x] PrismaService (database connection)
- [x] AuditLogService (platform-wide audit trail)
- [x] ActivityLogService (org-scoped activity feed)

### ✅ Vets Module (Complete)
- [x] Profile completion endpoint
- [x] Get profile endpoint
- [x] Approval status endpoint
- [x] Master Admin endpoints:
  - Get pending approvals
  - Approve vet
  - Reject vet
  - Suspend vet
  - Reactivate vet
- [x] All DTOs with validation
- [x] Complete service logic
- [x] Audit logging

### ✅ Organizations Module (Complete)
- [x] Create organization
- [x] Get all user organizations
- [x] Get organization details
- [x] Update organization (OWNER/ADMIN only)
- [x] Get organization members
- [x] Get activity logs (with permission check)
- [x] Auto-create OWNER membership on org creation
- [x] Slug generation with uniqueness
- [x] Complete DTOs
- [x] Activity logging

### ✅ Memberships & Invitations Module (Complete) ✨ NEW
- [x] Create invitation (OWNER/ADMIN)
- [x] Get organization invitations
- [x] Accept invitation
- [x] Decline invitation
- [x] Cancel invitation
- [x] Remove member (OWNER only)
- [x] Update member role (OWNER only)
- [x] Update permissions (OWNER only)
- [x] Leave organization
- [x] Invitation expiration (7 days)
- [x] Vet approval verification
- [x] OWNER protection
- [x] All DTOs with validation

### ✅ Clients Module (Complete) ✨ NEW
- [x] Create client
- [x] Get all clients (pagination, search)
- [x] Get client details
- [x] Update client
- [x] Soft delete (requires permission + reason)
- [x] Restore deleted client
- [x] Get client's animals
- [x] Cascade soft delete to animals and treatments
- [x] Search by name, email, phone
- [x] All DTOs with validation

### ✅ Animals Module (Complete) ✨ NEW
- [x] Register animal
- [x] Get all animals (pagination, filters)
- [x] Get animal details
- [x] Update animal
- [x] Soft delete (requires permission + reason)
- [x] Restore deleted animal
- [x] Record animal death
- [x] Get treatment history
- [x] Microchip uniqueness validation
- [x] Cascade soft delete to treatments
- [x] All DTOs with validation

### ✅ Treatments Module (Complete with Versioning) ✨ NEW
- [x] Create treatment record
- [x] Get all treatments (pagination, filters)
- [x] Get treatment details
- [x] Update treatment (creates new version)
- [x] Soft delete (requires permission + reason)
- [x] Restore deleted treatment
- [x] Get treatment versions
- [x] Versioning system (immutable old versions)
- [x] Parent-child version tracking
- [x] All DTOs with validation

## Remaining Features to Implement

### 🔲 Master Admin Dashboard (10 tasks - Partially functional)
Priority: **P1**

**Note**: Basic admin features already work via the Vets module. This epic is for enhanced dashboard features.

Endpoints needed:
- `GET /admin/dashboard/stats` - Platform statistics
- `GET /admin/vets` - All vets with filters
- `GET /admin/organizations` - All organizations
- `GET /admin/audit-logs` - Platform-wide audit logs
- `GET /admin/analytics` - Usage analytics

### 🔲 File Uploads Module (10 tasks)
Priority: **P1** (not critical for v1)

**Deferred**: Can be added post-MVP as enhancement

**Status**: Core invitations and membership management is complete!

Endpoints needed:
- `POST /orgs/:orgId/invitations` - Invite vet (OWNER/ADMIN)
- `GET /orgs/:orgId/invitations` - List invitations (OWNER/ADMIN)
- `POST /invitations/:token/accept` - Accept invitation
- `POST /invitations/:token/decline` - Decline invitation
- `DELETE /orgs/:orgId/members/:memberId` - Remove member (OWNER)
- `PATCH /orgs/:orgId/members/:memberId/role` - Change role (OWNER)
- `PATCH /orgs/:orgId/members/:memberId/permissions` - Grant/revoke delete permissions (OWNER only)

Key features:
- Email/SMS notifications on invitation
- Token expiration (7 days)
- Only invite approved vets
- OWNER cannot be removed
- Permission management

### 🔲 Clients Module (13 tasks)
Priority: **P0**

**Pattern**: Organizations module

Endpoints:
- `POST /orgs/:orgId/clients` - Create client
- `GET /orgs/:orgId/clients` - List clients (with pagination, search)
- `GET /orgs/:orgId/clients/:clientId` - Get client details
- `PATCH /orgs/:orgId/clients/:clientId` - Update client
- `DELETE /orgs/:orgId/clients/:clientId` - Soft delete (requires permission + reason)
- `POST /orgs/:orgId/clients/:clientId/restore` - Restore deleted client
- `GET /orgs/:orgId/clients/:clientId/animals` - Get client's animals

Guards needed:
- OrgScopeGuard
- DeletePermissionGuard (for delete operation with `canDeleteClients`)

Soft delete must:
- Set `isDeleted = true`
- Record `deletedAt`, `deletedBy`, `deletionReason`
- Cascade to animals and treatments
- Require mandatory reason

### 🔲 Animals Module (12 tasks)
Priority: **P0**

**Pattern**: Clients module (same structure)

Endpoints:
- `POST /orgs/:orgId/clients/:clientId/animals` - Register animal
- `GET /orgs/:orgId/animals` - List all animals in org
- `GET /orgs/:orgId/clients/:clientId/animals` - List client's animals
- `GET /orgs/:orgId/animals/:animalId` - Get animal details
- `PATCH /orgs/:orgId/animals/:animalId` - Update animal
- `DELETE /orgs/:orgId/animals/:animalId` - Soft delete (requires permission)
- `POST /orgs/:orgId/animals/:animalId/restore` - Restore deleted animal
- `PATCH /orgs/:orgId/animals/:animalId/death` - Record death
- `GET /orgs/:orgId/animals/:animalId/treatments` - Get treatment history

Key features:
- Soft delete with cascade to treatments
- Death recording
- Microchip uniqueness within org

### 🔲 Treatments Module (12 tasks)
Priority: **P0**

**Pattern**: Clients module

Endpoints:
- `POST /orgs/:orgId/animals/:animalId/treatments` - Create treatment record
- `GET /orgs/:orgId/treatments` - List treatments (with filters)
- `GET /orgs/:orgId/animals/:animalId/treatments` - Animal treatment history
- `GET /orgs/:orgId/treatments/:treatmentId` - Get treatment details
- `PATCH /orgs/:orgId/treatments/:treatmentId` - Update treatment (creates new version)
- `DELETE /orgs/:orgId/treatments/:treatmentId` - Soft delete (requires permission)
- `POST /orgs/:orgId/treatments/:treatmentId/restore` - Restore deleted treatment
- `GET /orgs/:orgId/treatments/:treatmentId/versions` - Get all versions

Key features:
- **Versioning**: Updates create new versions, old versions preserved
- Soft delete capability
- File attachments (Supabase Storage integration needed)
- Follow-up reminders

### 🔲 File Uploads Module (10 tasks)
Priority: **P1**

Integrate Supabase Storage for:
- Vet profile photos
- Organization logos
- Animal photos
- Treatment attachments (images, PDFs, lab results)

Endpoints:
- `POST /uploads/profile-photo` - Upload vet profile photo
- `POST /orgs/:orgId/logo` - Upload org logo
- `POST /orgs/:orgId/animals/:animalId/photo` - Upload animal photo
- `POST /orgs/:orgId/treatments/:treatmentId/attachments` - Upload treatment files
- `DELETE /uploads/:fileId` - Delete file

Security:
- Validate file types (images: jpg/png, docs: pdf)
- Size limits (profile: 5MB, attachments: 20MB)
- Store in org-scoped buckets
- Generate signed URLs for access

### 🔲 Notifications Module (12 tasks)
Priority: **P1**

Implement email (Resend) and SMS (Twilio) notifications.

Services needed:
- `EmailService` (Resend integration)
- `SmsService` (Twilio integration)
- `NotificationService` (orchestrates both)

Notification types:
- Vet profile submitted
- Vet approved/rejected/suspended/reactivated
- Invitation sent/accepted/declined
- Member removed/role changed
- Follow-up reminder
- Deletion notifications

Features:
- Async processing (consider Bull Queue)
- Retry logic (3 attempts)
- Delivery status tracking
- Template system

### 🔲 Dashboard & Analytics (10 tasks)
Priority: **P2**

Endpoints for dashboard data:
- `GET /orgs/:orgId/dashboard/stats` - Overview stats (clients, animals, treatments count)
- `GET /orgs/:orgId/dashboard/recent-activity` - Recent treatments
- `GET /orgs/:orgId/dashboard/follow-ups` - Upcoming follow-ups
- `GET /orgs/:orgId/analytics/treatments-over-time` - Chart data
- `GET /orgs/:orgId/analytics/top-diagnoses` - Common diagnoses

### 🔲 Search & Filters (8 tasks)
Priority: **P1**

Enhance all list endpoints with:
- Full-text search
- Advanced filters (date ranges, status, species)
- Sorting options
- Pagination metadata
- Export to CSV (optional)

### 🔲 Testing (15 tasks)
Priority: **P0** (before production)

- [ ] Unit tests for all services
- [ ] E2E tests for critical flows:
  - Authentication & approval flow
  - Organization creation & membership
  - Client -> Animal -> Treatment workflow
  - Soft delete and restore
  - Permission enforcement
- [ ] Test database seeding
- [ ] CI/CD pipeline with GitHub Actions

### 🔲 Deployment & Monitoring (8 tasks)
Priority: **P0** (before production)

- [ ] Sentry integration for error tracking
- [ ] Swagger/OpenAPI documentation
- [ ] Health check endpoints (database, external services)
- [ ] Logging strategy (structured logs)
- [ ] Environment-specific configs (dev, staging, prod)
- [ ] Database migration strategy
- [ ] Docker containerization
- [ ] Production deployment guide

## How to Implement Remaining Modules

All remaining modules should follow the **Organizations module** pattern:

### 1. Create Module Structure
```
src/
└── <module-name>/
    ├── dto/
    │   ├── create-<entity>.dto.ts
    │   └── update-<entity>.dto.ts
    ├── <module-name>.controller.ts
    ├── <module-name>.service.ts
    └── <module-name>.module.ts
```

### 2. Service Layer (`<module-name>.service.ts`)
- Inject `PrismaService`, `AuditLogService`, `ActivityLogService`
- Implement CRUD operations
- Add business logic validation
- Log all state-changing operations
- Handle errors with custom exceptions

### 3. Controller Layer (`<module-name>.controller.ts`)
- Apply guards in correct order:
  ```typescript
  @UseGuards(JwtAuthGuard, ApprovalGuard, OrgScopeGuard, RoleGuard)
  ```
- For delete operations, add:
  ```typescript
  @UseGuards(..., DeletePermissionGuard)
  @RequireDeletePermission('canDeleteClients')
  ```
- Use `@CurrentUser()` decorator to get authenticated vet
- Validate DTOs with class-validator

### 4. DTOs
- Use class-validator decorators
- Make required fields non-optional
- Add proper constraints (MinLength, IsEmail, IsEnum, etc.)

### 5. Register in AppModule
```typescript
import { <Module>Module } from './<module>/<module>.module';

@Module({
  imports: [
    // ... existing modules
    <Module>Module,
  ],
})
```

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update with your Supabase credentials:
   ```env
   DATABASE_URL="postgresql://..."
   SUPABASE_URL="https://xxx.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="..."
   SUPABASE_JWT_SECRET="..."
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build
npm run build

# Run in production mode
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Prisma Studio (database GUI)
npx prisma studio
```

## API Structure

All API responses follow this envelope:

**Success**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-08T...",
    "requestId": "uuid",
    "pagination": { ... }
  }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "code": "VET_NOT_APPROVED",
    "message": "Your profile is pending approval...",
    "statusCode": 403,
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-02-08T...",
    "requestId": "uuid"
  }
}
```

## Authentication

All protected endpoints require a Bearer token:
```
Authorization: Bearer <supabase_jwt_token>
```

The JWT is validated against the Supabase JWT secret and the user's vet record is loaded.

## Guard Layers (Applied in Order)

1. **ThrottlerGuard** (global) - Rate limiting
2. **JwtAuthGuard** (global, skippable with @Public) - Authentication
3. **ApprovalGuard** (global, skippable with @SkipApproval) - Vet approval check
4. **OrgScopeGuard** (route-specific) - Organization membership check
5. **RoleGuard** (route-specific) - Role-based access (use with @Roles)
6. **DeletePermissionGuard** (route-specific) - Delete permission check
7. **ActivityLogPermissionGuard** (route-specific) - Activity log access

## Testing the API

### 1. Health Check
```bash
curl http://localhost:3001/api/v1/health
```

### 2. Get Profile (requires auth)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/vets/profile
```

### 3. Create Organization
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Clinic","address":"123 Street","city":"Lagos","state":"Lagos","country":"NG","phoneNumber":"08012345678","type":"CLINIC"}' \
  http://localhost:3001/api/v1/orgs
```

## Next Steps

1. **Immediate Priority**: Implement Clients, Animals, and Treatments modules (core functionality)
2. **Secondary**: Memberships & Invitations (team collaboration)
3. **Then**: File uploads and Notifications (enhanced UX)
4. **Finally**: Analytics, Testing, and Production deployment

## Database Migrations

To create a new migration after schema changes:
```bash
npx prisma migrate dev --name <migration_name>
```

To apply migrations in production:
```bash
npx prisma migrate deploy
```

## Contributing

Follow the established patterns:
1. Use TypeScript strict mode
2. Validate all inputs with DTOs
3. Apply appropriate guards
4. Log all state changes to audit and activity logs
5. Use soft delete for user-facing entities
6. Handle errors with descriptive codes and messages
7. Write tests for new features

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact the development team.
