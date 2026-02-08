# Product Requirements Document (PRD)

## Veterinary Registration & Practice Management Platform

**Document Version:** 1.1.0
**Last Updated:** February 8, 2026
**Status:** Draft
**Author:** Engineering Team
**Stakeholders:** Product, Engineering, Compliance, Operations

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Objectives](#3-goals--objectives)
4. [Target Users & Personas](#4-target-users--personas)
5. [Product Scope](#5-product-scope)
6. [Technology Stack](#6-technology-stack)
7. [System Architecture Overview](#7-system-architecture-overview)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [User Entry & Authentication Flow](#9-user-entry--authentication-flow)
10. [Vet Profile Completion & Verification](#10-vet-profile-completion--verification)
11. [Master Admin Approval Workflow](#11-master-admin-approval-workflow)
12. [Organization (Clinic) Lifecycle](#12-organization-clinic-lifecycle)
13. [Organization Membership & Roles](#13-organization-membership--roles)
14. [Client Management](#14-client-management)
15. [Animal Management](#15-animal-management)
16. [Medical Treatment & History](#16-medical-treatment--history)
17. [Notifications System](#17-notifications-system)
17A. [Organization Activity Log](#17a-organization-activity-log)
18. [Account Suspension & Enforcement](#18-account-suspension--enforcement)
19. [Security Enforcement Model](#19-security-enforcement-model)
20. [Database Schema Design](#20-database-schema-design)
21. [API Design & Endpoints](#21-api-design--endpoints)
22. [Row Level Security (RLS) Policies](#22-row-level-security-rls-policies)
23. [Frontend Pages & UI Flow](#23-frontend-pages--ui-flow)
24. [Error Handling & Edge Cases](#24-error-handling--edge-cases)
25. [Audit Logging](#25-audit-logging)
26. [Performance & Scalability](#26-performance--scalability)
27. [Testing Strategy](#27-testing-strategy)
28. [Deployment & Infrastructure](#28-deployment--infrastructure)
29. [Compliance & Data Privacy](#29-compliance--data-privacy)
30. [Future Roadmap](#30-future-roadmap)
31. [Glossary](#31-glossary)

---

## 1. Executive Summary

This document defines the complete product requirements for a **Veterinary Registration & Practice Management Platform** — a multi-tenant, organization-scoped web application that enables licensed veterinarians to register, get verified, create or join veterinary clinics (organizations), manage clients and their animals, and maintain versioned, auditable medical treatment records.

The platform enforces a **verification-first model**: every veterinarian must be authenticated via Google OAuth, submit credentials (including their Veterinary Council Number), and be approved by a Master Admin before gaining access to any core functionality. All data is strictly scoped to organizations, ensuring complete isolation between clinics. Every medical record is versioned and auditable, with deletion of records (clients, animals, and treatments) governed by **explicit, granular permissions** that must be granted to individual members. Every organization has a dedicated **Activity Log** providing full visibility into who did what and when.

The system is built on **NestJS** (backend), **Next.js** (frontend), and **Supabase** (database, auth, storage), and is designed to scale horizontally by organization count while maintaining strict data integrity and security guarantees.

---

## 2. Problem Statement

### 2.1 Current Industry Challenges

- **No centralized verification:** Veterinary professionals lack a unified platform to verify their credentials and practice legitimacy.
- **Paper-based records:** Many veterinary clinics still rely on paper records, leading to data loss, illegibility, and inability to track treatment history.
- **No data isolation:** Existing generic practice management tools do not enforce strict data isolation between clinics.
- **Lack of audit trails:** Treatment records can be modified or deleted without any traceability, creating compliance and liability risks.
- **Fragmented communication:** Notifications about approvals, invitations, and account status changes are handled manually.

### 2.2 What This Platform Solves

- Provides a **verified registry** of licensed veterinarians.
- Delivers a **multi-tenant, organization-scoped** practice management system.
- Ensures **versioned medical records** with full audit trails and permission-gated deletion.
- Enforces **role-based access control with granular delete permissions** at every layer (API, database, UI).
- Provides **per-organization activity logs** so every team knows who did what and when.
- Automates **notifications** via email and SMS for critical system events.

---

## 3. Goals & Objectives

### 3.1 Primary Goals

| # | Goal | Success Metric |
|---|------|---------------|
| G1 | Verify every veterinarian's identity and credentials before granting platform access | 100% of active vets have verified VCN |
| G2 | Provide complete data isolation between organizations | Zero cross-organization data leaks |
| G3 | Maintain auditable, versioned medical records with permission-gated deletion | 100% version history; all deletions tracked with who/when/why |
| G4 | Enable multi-clinic management with role-based access | Vets can belong to multiple organizations with distinct roles |
| G5 | Automate notifications for all critical workflow events | <30s delivery time for email/SMS notifications |

### 3.2 Non-Goals (Out of Scope for V1)

- Client (pet owner) self-service portal
- Payment processing or invoicing
- Appointment scheduling
- Inventory management
- Mobile native applications (responsive web only in V1)
- Integration with external veterinary lab systems
- Telemedicine/video consultation
- Prescription generation or pharmacy integration

---

## 4. Target Users & Personas

### 4.1 Master Admin

- **Who:** Platform operator(s) responsible for verifying and managing veterinarians.
- **Responsibilities:** Approve/reject vet applications, suspend/reactivate accounts, monitor platform health.
- **Access Level:** Global — can see all vets, all organizations (read-only), all audit logs.
- **Count:** 1–5 users (seeded in database, not self-registered).

### 4.2 Veterinarian (Vet)

- **Who:** A licensed veterinary professional seeking to use the platform.
- **Lifecycle States:**
  - `PENDING_APPROVAL` — Just registered, awaiting Master Admin review.
  - `APPROVED` — Fully verified, can create/join organizations and use all features.
  - `REJECTED` — Application denied, cannot access platform features.
  - `SUSPENDED` — Previously approved but temporarily barred from access.
- **Access Level:** Organization-scoped — can only see data within organizations they belong to.

### 4.3 Organization Admin

- **Who:** An approved vet who created an organization or was granted admin role within one.
- **Responsibilities:** Manage organization settings, invite/remove vets, manage memberships.
- **Access Level:** Full CRUD within their organization.

### 4.4 Organization Member (Staff Vet)

- **Who:** An approved vet who has been invited to and accepted membership in an organization.
- **Responsibilities:** Manage clients, animals, and treatment records within the organization.
- **Access Level:** Read/write for clients, animals, and treatments; no admin-level actions.

---

## 5. Product Scope

### 5.1 Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Google OAuth Authentication | Sign up and log in exclusively via Google | P0 |
| Vet Profile Registration | Submit personal and professional details post-signup | P0 |
| Master Admin Dashboard | Review, approve, reject, suspend vets | P0 |
| Organization Management | Create, update, manage veterinary clinics | P0 |
| Organization Membership | Invite, accept, assign roles to vets within orgs | P0 |
| Client Management | Register and manage pet owners within an org | P0 |
| Animal Management | Register and manage animals linked to clients | P0 |
| Medical Treatment Records | Create, view, version treatment records | P0 |
| Notification System | Email + SMS for approvals, rejections, invitations | P1 |
| Audit Logging | Track all system actions for compliance | P0 |
| Search & Filtering | Search clients, animals, records within org | P1 |
| Dashboard & Analytics | Org-level stats (patient count, treatment count) | P2 |

### 5.2 Feature Dependencies

```
Google OAuth
  └── Vet Profile Registration
        └── Master Admin Approval
              └── Organization Creation
                    ├── Organization Membership (Invitations)
                    ├── Client Management
                    │     └── Animal Management
                    │           └── Medical Treatment Records
                    └── Organization Settings
```

---

## 6. Technology Stack

### 6.1 Backend

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Runtime | Node.js (LTS) | Async I/O, large ecosystem |
| Framework | NestJS | Modular architecture, guards, interceptors, decorators |
| Language | TypeScript (strict mode) | Type safety, maintainability |
| ORM | Prisma | Type-safe queries, migrations, introspection |
| Validation | class-validator + class-transformer | DTO validation with decorators |
| API Style | RESTful with consistent response envelope | Simplicity, wide client support |
| Documentation | Swagger/OpenAPI via @nestjs/swagger | Auto-generated API docs |

### 6.2 Frontend

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Framework | Next.js 14+ (App Router) | SSR, SSG, API routes, file-based routing |
| Language | TypeScript | Consistency with backend |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, accessible components |
| State Management | React Context + TanStack Query | Server state caching, minimal client state |
| Forms | React Hook Form + Zod | Performant forms with schema validation |
| Auth Client | Supabase Auth (@supabase/ssr) | Seamless Google OAuth integration |

### 6.3 Infrastructure & Services

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Database | Supabase (PostgreSQL) | Managed Postgres, RLS, realtime, auth |
| Authentication | Supabase Auth (Google OAuth) | Managed OAuth, JWT issuance |
| File Storage | Supabase Storage | Profile photos, document uploads |
| Email | Resend or SendGrid | Transactional email delivery |
| SMS | Twilio or Africa's Talking | SMS notifications |
| Hosting (Frontend) | Vercel | Optimized for Next.js |
| Hosting (Backend) | Railway or Render | Managed Node.js hosting |
| CI/CD | GitHub Actions | Automated testing, linting, deployment |
| Monitoring | Sentry | Error tracking, performance monitoring |

---

## 7. System Architecture Overview

### 7.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│                     Next.js (App Router)                       │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│    │  Public   │  │   Auth   │  │ Dashboard │  │  Admin   │   │
│    │  Pages   │  │  Pages   │  │  Pages    │  │  Pages   │   │
│    └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS (JWT in Authorization header)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (NestJS)                          │
│  ┌─────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │ Guards   │  │  Controllers │  │     Services          │    │
│  │ ─ Auth   │  │  ─ Vet       │  │  ─ VetService         │    │
│  │ ─ Approval│ │  ─ Org       │  │  ─ OrgService         │    │
│  │ ─ Role   │  │  ─ Client    │  │  ─ ClientService      │    │
│  │ ─ Org    │  │  ─ Animal    │  │  ─ AnimalService      │    │
│  │          │  │  ─ Treatment │  │  ─ TreatmentService   │    │
│  │          │  │  ─ Admin     │  │  ─ AdminService       │    │
│  │          │  │  ─ Invite    │  │  ─ NotificationService│    │
│  └─────────┘  └──────────────┘  │  ─ AuditService       │    │
│                                  └──────────────────────┘    │
└──────────────────────────┬───────────────────────────────────┘
                           │ Prisma ORM
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                       │
│  ┌────────────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │  Tables + RLS  │  │  Auth      │  │  Storage          │   │
│  │  (vets, orgs,  │  │  (Google   │  │  (profile pics,   │   │
│  │   clients,     │  │   OAuth)   │  │   documents)      │   │
│  │   animals,     │  └────────────┘  └──────────────────┘   │
│  │   treatments,  │                                          │
│  │   audit_logs)  │                                          │
│  └────────────────┘                                          │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Request Lifecycle

Every API request follows this exact pipeline:

```
Client Request
  │
  ├─ 1. HTTPS/TLS termination
  │
  ├─ 2. NestJS Global Middleware
  │     ├── Request logging (method, path, IP, user-agent)
  │     ├── Rate limiting (per-IP and per-user)
  │     └── CORS validation
  │
  ├─ 3. AuthGuard (authentication)
  │     ├── Extract JWT from Authorization header
  │     ├── Verify JWT signature with Supabase public key
  │     ├── Check token expiration
  │     ├── Extract user ID and email from token claims
  │     ├── Attach user context to request object
  │     └── FAIL → 401 Unauthorized
  │
  ├─ 4. ApprovalGuard (vet status check)
  │     ├── Look up vet record by authenticated user ID
  │     ├── Check vet.status === 'APPROVED'
  │     ├── PENDING_APPROVAL → 403 "Account pending approval"
  │     ├── REJECTED → 403 "Account rejected: {reason}"
  │     ├── SUSPENDED → 403 "Account suspended: {reason}"
  │     └── FAIL → 403 Forbidden
  │
  ├─ 5. RoleGuard (role-based access)
  │     ├── Extract required roles from route metadata
  │     ├── Look up vet's role within target organization
  │     ├── Verify role satisfies minimum requirement
  │     └── FAIL → 403 Insufficient permissions
  │
  ├─ 6. OrgScopeGuard (organization isolation)
  │     ├── Extract organization ID from route params or body
  │     ├── Verify vet has active membership in organization
  │     ├── Inject organization ID into query scope
  │     └── FAIL → 403 "Not a member of this organization"
  │
  ├─ 7. DTO Validation (ValidationPipe)
  │     ├── Transform request body/params/query to DTO class
  │     ├── Run class-validator decorators
  │     ├── Strip unknown properties (whitelist: true)
  │     └── FAIL → 400 Bad Request with field-level errors
  │
  ├─ 8. Controller → Service → Prisma → Database
  │
  ├─ 9. Response Interceptor
  │     ├── Wrap response in standard envelope
  │     └── { success: true, data: {...}, meta: {...} }
  │
  └─ 10. Exception Filter (on error)
        ├── Catch all exceptions
        ├── Map to standard error response
        ├── Log error details (Sentry + structured logs)
        └── { success: false, error: { code, message, details } }
```

### 7.3 Standard API Response Envelope

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-08T12:00:00.000Z",
    "requestId": "uuid-v4",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VET_NOT_APPROVED",
    "message": "Your account has not been approved yet.",
    "statusCode": 403,
    "details": null
  },
  "meta": {
    "timestamp": "2026-02-08T12:00:00.000Z",
    "requestId": "uuid-v4"
  }
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "statusCode": 400,
    "details": [
      { "field": "phoneNumber", "message": "Phone number must be a valid format" },
      { "field": "vcnNumber", "message": "VCN number is required" }
    ]
  },
  "meta": {
    "timestamp": "2026-02-08T12:00:00.000Z",
    "requestId": "uuid-v4"
  }
}
```

---

## 8. Authentication & Authorization

### 8.1 Authentication Provider

- **Provider:** Supabase Auth with Google OAuth 2.0
- **Flow:** Authorization Code Flow with PKCE
- **Token Type:** JWT (RS256)
- **Token Lifetime:** 1 hour (access token), 7 days (refresh token)
- **Token Storage:** HTTP-only secure cookies managed by `@supabase/ssr`

### 8.2 Authentication Flow (Detailed)

```
1. User clicks "Sign in with Google" on frontend
2. Frontend calls supabase.auth.signInWithOAuth({ provider: 'google' })
3. User is redirected to Google's consent screen
4. User grants permission
5. Google redirects back to the app's callback URL with authorization code
6. Supabase exchanges the code for tokens
7. Supabase creates/updates the auth.users record
8. Supabase issues a JWT access token + refresh token
9. Frontend stores tokens in HTTP-only cookies via @supabase/ssr
10. All subsequent API calls include the JWT in the Authorization header:
    Authorization: Bearer <jwt_token>
```

### 8.3 JWT Token Claims

The JWT issued by Supabase contains:

```json
{
  "sub": "uuid-of-supabase-auth-user",
  "email": "vet@gmail.com",
  "aud": "authenticated",
  "role": "authenticated",
  "exp": 1707400000,
  "iat": 1707396400,
  "app_metadata": {
    "provider": "google"
  },
  "user_metadata": {
    "full_name": "Dr. Jane Smith",
    "avatar_url": "https://lh3.googleusercontent.com/..."
  }
}
```

### 8.4 Backend Token Validation

The NestJS `AuthGuard` performs the following on every protected request:

1. Extract the `Authorization: Bearer <token>` header.
2. If missing → return `401 Unauthorized`.
3. Verify the JWT signature using Supabase's JWT secret or JWKS endpoint.
4. Check `exp` claim — if expired → return `401 Token expired`.
5. Check `aud` claim — must be `"authenticated"`.
6. Extract `sub` (user ID) and `email` from the token.
7. Look up the corresponding vet record in the `vets` table using `auth_user_id = sub`.
8. Attach the vet record to `request.user` for downstream use.

### 8.5 Authorization Layers

| Layer | Guard | Purpose | Failure Code |
|-------|-------|---------|-------------|
| 1 | `AuthGuard` | Is the user authenticated? | 401 |
| 2 | `ApprovalGuard` | Is the vet's account approved? | 403 |
| 3 | `RoleGuard` | Does the vet have the required role? | 403 |
| 4 | `OrgScopeGuard` | Is the vet a member of the target org? | 403 |
| 5 | `DeletePermissionGuard` | Does the vet have the specific delete permission? (Only applied to delete endpoints) | 403 |

**DeletePermissionGuard Details:**

The `DeletePermissionGuard` is a **parameterized guard** that accepts the name of the specific delete permission to check. It is only applied to deletion endpoints.

```typescript
// Usage on a controller method:
@Delete(':clientId')
@UseGuards(AuthGuard, ApprovalGuard, RoleGuard(MembershipRole.MEMBER), OrgScopeGuard, DeletePermissionGuard('canDeleteClients'))
async deleteClient(...) { ... }
```

Guard logic:
1. Extract the vet's membership for the target organization (already attached by OrgScopeGuard).
2. If the vet's role is `OWNER` → always allow (OWNERs have implicit delete permissions).
3. Check the specific permission flag on the membership record (e.g., `canDeleteClients`).
4. If `false` → return `403 "You do not have permission to delete this resource. Contact your organization admin."`.
5. If `true` → allow.

### 8.6 Route Protection Matrix

| Route Pattern | Auth | Approval | Role | Org Scope | Special Permission |
|--------------|------|----------|------|-----------|-------------------|
| `POST /auth/callback` | No | No | No | No | — |
| `GET /auth/me` | Yes | No | No | No | — |
| `POST /vets/profile` | Yes | No | No | No | — |
| `GET /admin/*` | Yes | Yes | MASTER_ADMIN | No | — |
| `POST /orgs` | Yes | Yes | No | No | — |
| `GET /orgs/:orgId/*` | Yes | Yes | MEMBER+ | Yes | — |
| `GET /orgs/:orgId/activity-log` | Yes | Yes | MEMBER+ | Yes | OWNER or `canViewActivityLog` |
| `POST /orgs/:orgId/invite` | Yes | Yes | ADMIN+ | Yes | No |
| `POST /orgs/:orgId/clients` | Yes | Yes | MEMBER+ | Yes | — |
| `DELETE /orgs/:orgId/clients/:id` | Yes | Yes | MEMBER+ | Yes | `canDeleteClients` |
| `POST /orgs/:orgId/animals` | Yes | Yes | MEMBER+ | Yes | — |
| `DELETE /orgs/:orgId/animals/:id` | Yes | Yes | MEMBER+ | Yes | `canDeleteAnimals` |
| `POST /orgs/:orgId/treatments` | Yes | Yes | MEMBER+ | Yes | — |
| `DELETE /orgs/:orgId/treatments/:id` | Yes | Yes | MEMBER+ | Yes | `canDeleteTreatments` |
| `DELETE /orgs/:orgId/members/:id` | Yes | Yes | ADMIN+ | Yes | — |
| `PATCH /orgs/:orgId/members/:id/permissions` | Yes | Yes | OWNER | Yes | — |

---

## 9. User Entry & Authentication Flow

### 9.1 Initial Access

**Public Routes (No Authentication Required):**

| Page | Route | Purpose |
|------|-------|---------|
| Home/Landing | `/` | Marketing page explaining the platform |
| Login | `/login` | Google OAuth sign-in button |
| Signup | `/signup` | Same as login (Google OAuth is the only method) |
| About | `/about` | Platform information |
| Privacy Policy | `/privacy` | Data privacy information |
| Terms of Service | `/terms` | Terms and conditions |

**All other routes require authentication.** Unauthenticated users attempting to access protected pages are redirected to `/login` with a `?redirect=<original_path>` query parameter so they return to the intended page after login.

### 9.2 Signup Flow (Detailed Step-by-Step)

```
Step 1: User navigates to /signup (or /login — they are functionally identical)
Step 2: User clicks "Sign in with Google"
Step 3: supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })
Step 4: Google OAuth consent screen displayed
Step 5: User selects Google account and grants permission
Step 6: Redirect to /auth/callback with code
Step 7: Frontend exchanges code for session via supabase.auth.exchangeCodeForSession(code)
Step 8: Frontend calls GET /api/auth/me to check vet status
Step 9: Backend AuthGuard validates JWT
Step 10: Backend checks if vet record exists for this auth user ID
Step 11: IF vet record does NOT exist:
    a. Create new vet record with status = PENDING_APPROVAL
    b. Set auth_user_id, email, google_display_name, google_avatar_url from token
    c. Return { isNewUser: true, vet: { id, status: 'PENDING_APPROVAL', profileCompleted: false } }
    d. Frontend redirects to /onboarding/profile
Step 12: IF vet record EXISTS:
    a. Return vet record with current status
    b. Frontend routes based on status:
       - PENDING_APPROVAL + profile incomplete → /onboarding/profile
       - PENDING_APPROVAL + profile complete → /onboarding/pending
       - APPROVED → /dashboard
       - REJECTED → /account/rejected
       - SUSPENDED → /account/suspended
```

### 9.3 Login Flow (Returning User)

```
Step 1: User navigates to /login
Step 2: User clicks "Sign in with Google"
Step 3: Google OAuth flow (same as signup)
Step 4: Frontend calls GET /api/auth/me
Step 5: Backend returns existing vet record
Step 6: Frontend routes based on vet status (same logic as Step 12 above)
```

### 9.4 Session Management

- **Access Token Refresh:** The frontend automatically refreshes the access token using the refresh token before it expires. `@supabase/ssr` handles this transparently.
- **Session Expiry:** If both access and refresh tokens are expired, the user is redirected to `/login`.
- **Sign Out:** Calls `supabase.auth.signOut()`, clears cookies, redirects to `/`.
- **Multiple Tabs:** Session state is synchronized across browser tabs via Supabase's built-in listener (`onAuthStateChange`).

---

## 10. Vet Profile Completion & Verification

### 10.1 Profile Submission (Onboarding)

After first-time Google authentication, the vet is directed to the onboarding profile form. This is a **multi-step form** with the following sections:

#### Step 1: Personal Information

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `fullName` | string | Yes | Min 2, max 100 chars; letters, spaces, hyphens only |
| `phoneNumber` | string | Yes | Valid phone format (E.164 recommended, e.g., +2348012345678) |
| `dateOfBirth` | date | No | Must be a past date; vet must be at least 22 years old |
| `gender` | enum | No | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| `profilePhotoUrl` | string | No | Uploaded to Supabase Storage; max 5MB; JPEG/PNG only |

#### Step 2: Professional Information

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `vcnNumber` | string | Yes | Unique across all vets; alphanumeric; exact format TBD by regulatory body |
| `specialization` | string | No | Free text; max 200 chars |
| `yearsOfExperience` | integer | No | Min 0, max 70 |
| `qualifications` | string[] | No | Array of qualification strings |
| `universityAttended` | string | No | Max 200 chars |
| `graduationYear` | integer | No | Between 1950 and current year |

#### Step 3: Practice Information

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `practiceAddress` | string | Yes | Max 500 chars |
| `city` | string | Yes | Max 100 chars |
| `state` | string | Yes | Must be a valid state/region |
| `country` | string | Yes | Default: "Nigeria"; ISO 3166-1 alpha-2 |
| `practiceType` | enum | No | SMALL_ANIMAL, LARGE_ANIMAL, MIXED, EXOTIC, EQUINE, AVIAN, OTHER |

### 10.2 Backend Validation Rules

The `POST /api/vets/profile` endpoint performs the following validations:

1. **Authentication Check:** JWT must be valid (AuthGuard).
2. **Vet Existence Check:** Vet record must exist for the authenticated user.
3. **Profile Not Already Submitted:** If `profileCompleted === true`, return `409 Conflict — Profile already submitted`.
4. **Required Fields:** All required fields must be present and non-empty.
5. **VCN Uniqueness:** Query `vets` table for existing record with same `vcnNumber`. If found → `409 Conflict — VCN already registered`.
6. **Email Consistency:** The email on the vet record must match the email from the JWT. No manual email changes allowed.
7. **Phone Format:** Must match E.164 format or a locally accepted format.
8. **Data Sanitization:** Strip HTML tags, trim whitespace, normalize unicode.

### 10.3 After Profile Submission

1. Vet record is updated with all submitted fields.
2. `profileCompleted` is set to `true`.
3. `profileSubmittedAt` timestamp is recorded.
4. Vet status remains `PENDING_APPROVAL`.
5. An entry is added to the Master Admin's review queue.
6. An audit log entry is created: `VET_PROFILE_SUBMITTED`.
7. A confirmation email is sent to the vet: "Your profile has been submitted and is under review."
8. Frontend redirects to `/onboarding/pending` — a waiting screen that says "Your application is under review. You will be notified once approved."

### 10.4 Profile Edit Before Approval

- Vets **can** edit their profile while in `PENDING_APPROVAL` status.
- Each edit resets the `profileSubmittedAt` timestamp.
- Each edit is logged in the audit trail.
- If the VCN is changed, the uniqueness check runs again.

### 10.5 Profile Edit After Approval

- Approved vets can update non-sensitive fields (phone, address, specialization, etc.).
- **VCN cannot be changed** after approval. Requires Master Admin intervention.
- **Email cannot be changed** (tied to Google account).
- Profile updates are logged in the audit trail.

---

## 11. Master Admin Approval Workflow

### 11.1 Master Admin Identity

- Master Admins are **not self-registered**. They are seeded directly into the database.
- A Master Admin has a record in the `vets` table with `isMasterAdmin: true`.
- Master Admins are not subject to the approval flow — they are pre-approved.
- There should be at least 1 Master Admin at all times.

### 11.2 Admin Dashboard — Vet Review Queue

The Master Admin dashboard at `/admin/vets` displays:

**Queue Tabs:**
- **Pending Review** — Vets with status `PENDING_APPROVAL` and `profileCompleted === true`, sorted by `profileSubmittedAt` ascending (FIFO).
- **Approved** — All approved vets.
- **Rejected** — All rejected vets with rejection reasons.
- **Suspended** — All suspended vets.
- **All** — All vets regardless of status.

**Queue Item Display:**
- Full name
- Email
- Phone number
- VCN number
- Specialization
- Practice location
- Profile photo (if uploaded)
- Submission date
- Time in queue (e.g., "Submitted 3 days ago")

### 11.3 Approval Action

When Master Admin clicks "Approve":

1. Backend verifies the acting user is a Master Admin.
2. Vet status is updated from `PENDING_APPROVAL` to `APPROVED`.
3. `approvedAt` timestamp is set.
4. `approvedBy` is set to the Master Admin's vet ID.
5. Audit log entry: `VET_APPROVED` with admin ID.
6. **Email notification** sent to vet: "Your account has been approved. You can now access the platform."
7. **SMS notification** sent to vet: "Your VetReg account has been approved. Log in at [url]."

### 11.4 Rejection Action

When Master Admin clicks "Reject":

1. A modal prompts for a **rejection reason** (required, min 10 characters).
2. Backend verifies the acting user is a Master Admin.
3. Vet status is updated to `REJECTED`.
4. `rejectedAt` timestamp is set.
5. `rejectedBy` is set to the Master Admin's vet ID.
6. `rejectionReason` is stored.
7. Audit log entry: `VET_REJECTED` with admin ID and reason.
8. **Email notification** sent to vet: "Your application has been rejected. Reason: {reason}."
9. **SMS notification** sent to vet: "Your VetReg application was not approved. Check your email for details."

### 11.5 Re-Application After Rejection

- Rejected vets **can** update their profile and resubmit.
- Upon resubmission:
  - Status changes back to `PENDING_APPROVAL`.
  - `profileSubmittedAt` is updated.
  - Vet re-enters the review queue.
  - Previous rejection reason is preserved in history.
  - Audit log entry: `VET_RESUBMITTED`.

### 11.6 Suspension from Admin Dashboard

See [Section 18: Account Suspension & Enforcement](#18-account-suspension--enforcement) for full details.

### 11.7 Admin Dashboard — Platform Statistics

The Master Admin dashboard also shows:

- Total registered vets (by status breakdown)
- Total organizations
- Total clients across all orgs
- Total animals across all orgs
- Total treatment records
- Registrations over time (chart)
- Pending queue depth and average wait time

---

## 12. Organization (Clinic) Lifecycle

### 12.1 Organization Creation

**Endpoint:** `POST /api/orgs`

**Prerequisites:**
- Vet must be authenticated (AuthGuard)
- Vet must be approved (ApprovalGuard)

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `name` | string | Yes | Min 2, max 200 chars; unique per vet (a vet can't create two orgs with the same name) |
| `description` | string | No | Max 1000 chars |
| `address` | string | Yes | Max 500 chars |
| `city` | string | Yes | Max 100 chars |
| `state` | string | Yes | Valid state/region |
| `country` | string | Yes | ISO 3166-1 alpha-2 |
| `phoneNumber` | string | Yes | Valid phone format |
| `email` | string | No | Valid email format |
| `website` | string | No | Valid URL format |
| `logoUrl` | string | No | Uploaded to Supabase Storage |
| `type` | enum | No | CLINIC, HOSPITAL, MOBILE_PRACTICE, RESEARCH_LAB, OTHER |

**Backend Processing:**

1. Validate all fields.
2. Create organization record.
3. Create `org_memberships` record:
   - `vetId` = creating vet's ID
   - `organizationId` = new org's ID
   - `role` = `OWNER`
   - `status` = `ACTIVE`
   - `joinedAt` = now
4. Audit log: `ORGANIZATION_CREATED`.
5. Return the created organization.

### 12.2 Organization Data Model

```
Organization {
  id: UUID (PK)
  name: string
  slug: string (auto-generated, URL-friendly, unique)
  description: string?
  address: string
  city: string
  state: string
  country: string
  phoneNumber: string
  email: string?
  website: string?
  logoUrl: string?
  type: OrgType
  isActive: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: UUID (FK → vets.id)
}
```

### 12.3 Organization Isolation

**Every piece of data created within an organization is scoped to that organization:**

- Clients belong to an organization.
- Animals belong to a client (and transitively to an organization).
- Treatment records belong to an animal (and transitively to an organization).

**Isolation is enforced at three levels:**

1. **Application Level:** Every query includes `WHERE organizationId = :orgId`.
2. **Guard Level:** `OrgScopeGuard` verifies the requesting vet is a member of the target organization.
3. **Database Level:** Supabase RLS policies restrict row access based on the authenticated user's organization memberships.

### 12.4 Organization Settings (Admin Only)

Organization admins can update:
- Organization name, description, address, contact info
- Logo
- Organization type

Organization admins **cannot**:
- Delete the organization (soft-delete only, requires Master Admin)
- Transfer ownership (V1 — future feature)

### 12.5 Multi-Organization Support

- A vet can belong to **multiple organizations**.
- A vet can have **different roles** in different organizations (e.g., OWNER of Org A, MEMBER of Org B).
- The frontend provides an **organization switcher** in the top navigation bar.
- All data views, queries, and actions are scoped to the **currently selected organization**.

---

## 13. Organization Membership & Roles

### 13.1 Roles

| Role | Hierarchy Level | Description |
|------|----------------|-------------|
| `OWNER` | 3 (highest) | Created the organization; full control; cannot be removed |
| `ADMIN` | 2 | Can manage members, clients, animals, treatments, org settings |
| `MEMBER` | 1 (lowest) | Can manage clients, animals, treatments; cannot manage members or settings |

### 13.2 Role Permissions Matrix

| Action | OWNER | ADMIN | MEMBER |
|--------|-------|-------|--------|
| View org dashboard | Yes | Yes | Yes |
| Create/edit clients | Yes | Yes | Yes |
| Create/edit animals | Yes | Yes | Yes |
| Create treatments | Yes | Yes | Yes |
| View treatments | Yes | Yes | Yes |
| **Delete clients** | **Yes** | **Requires explicit grant** | **Requires explicit grant** |
| **Delete animals** | **Yes** | **Requires explicit grant** | **Requires explicit grant** |
| **Delete treatments** | **Yes** | **Requires explicit grant** | **Requires explicit grant** |
| Invite members | Yes | Yes | No |
| Accept/reject membership requests | Yes | Yes | No |
| Change member roles | Yes | Yes (cannot promote to OWNER) | No |
| Remove members | Yes | Yes (cannot remove OWNER) | No |
| Grant/revoke permissions | Yes | No | No |
| Edit org settings | Yes | Yes | No |
| Delete organization | Yes | No | No |
| View activity log | Yes | **Requires explicit grant** | **No** |
| View audit logs | Yes | Yes | No |

### 13.2.1 Granular Permissions

Several sensitive operations require **explicit permission grants** on a per-member basis. These permissions are **not granted by default** to any role except OWNER.

**Permission Flags (on `org_memberships`):**

| Permission | Default (OWNER) | Default (ADMIN) | Default (MEMBER) | Description |
|-----------|-----------------|-----------------|-------------------|-------------|
| `canDeleteClients` | `true` (always) | `false` | `false` | Can soft-delete client records |
| `canDeleteAnimals` | `true` (always) | `false` | `false` | Can soft-delete animal records |
| `canDeleteTreatments` | `true` (always) | `false` | `false` | Can soft-delete treatment records |
| `canViewActivityLog` | `true` (always) | `false` | `false` | Can view organization activity log |

**Key Rules:**

1. **OWNER always has all permissions** — these cannot be revoked.
2. **ADMIN and MEMBER start with all permissions set to `false`** by default.
3. **Only OWNER can grant any permissions** (including `canViewActivityLog`).
4. **ADMIN cannot grant permissions to themselves or others** — only an OWNER can.
5. **MEMBER cannot grant or revoke any permissions.**
6. Each permission is **independent** — a member can have `canDeleteAnimals: true` but `canDeleteClients: false` and `canViewActivityLog: false`.
7. Permission changes are **logged in the activity log** (if the acting user has access) and **audit log** with who granted/revoked and when.

**Granting Permissions:**

```
PATCH /api/orgs/:orgId/members/:vetId/permissions
Body: {
  "canDeleteClients": true,
  "canDeleteAnimals": true,
  "canDeleteTreatments": false,
  "canViewActivityLog": true
}
```

Backend processing:
1. Guards: Auth → Approval → Role → OrgScope
2. Verify the acting user is **OWNER** of this org (only OWNERs can grant permissions).
3. If acting user is not OWNER: return `403 "Only organization owners can manage permissions"`.
4. If target is OWNER: return `403 "Cannot modify owner permissions"`.
5. Update the membership record with the new permission flags.
6. Activity log entry: `MEMBER_PERMISSIONS_UPDATED` with before/after values (if acting user has activity log access).
7. Audit log entry: `MEMBER_PERMISSIONS_UPDATED`.
8. Notify the affected vet via email about the permission change.

**Reading Permissions:**

```
GET /api/orgs/:orgId/members/:vetId/permissions
```

Returns the current permission flags for the member. Only OWNER can call this endpoint.

### 13.3 Invitation Flow (Detailed)

**Step 1: Admin Sends Invitation**

```
POST /api/orgs/:orgId/invitations
Body: { email: "newvet@gmail.com", role: "MEMBER" }
```

Backend processing:
1. Verify inviter is ADMIN+ in this org (RoleGuard).
2. Check if email belongs to a registered vet:
   - If yes: Check if vet is APPROVED. If not approved → `400 "Invited vet must be approved"`.
   - If no vet record exists → invitation is still created (vet can accept after registering).
3. Check if vet is already a member of this org → `409 "Already a member"`.
4. Check if there's already a pending invitation for this email → `409 "Invitation already pending"`.
5. Create invitation record:
   - `organizationId`, `invitedEmail`, `role`, `invitedBy`, `status: PENDING`, `expiresAt: now + 7 days`
6. Generate a unique invitation token (UUID v4).
7. Send **email notification** to invited vet:
   - Subject: "You've been invited to join {orgName} on VetReg"
   - Body includes: org name, inviter name, role, accept link with token
8. Send **SMS notification** (if phone number available).
9. Audit log: `INVITATION_SENT`.

**Step 2: Invited Vet Accepts**

```
POST /api/invitations/:token/accept
```

Backend processing:
1. Look up invitation by token.
2. Check invitation is not expired → `410 "Invitation expired"`.
3. Check invitation status is PENDING → `409 "Invitation already processed"`.
4. Verify the authenticated user's email matches `invitedEmail` → `403 "This invitation is for a different email"`.
5. Verify the vet is APPROVED → `403 "Vet not approved"`.
6. Create `org_memberships` record:
   - `vetId`, `organizationId`, `role` (from invitation), `status: ACTIVE`, `joinedAt: now`
7. Update invitation status to `ACCEPTED`.
8. Audit log: `INVITATION_ACCEPTED`.
9. Notify org admins: "Dr. {name} has joined {orgName}."

**Step 3: Invited Vet Declines**

```
POST /api/invitations/:token/decline
```

Backend processing:
1. Same validation as accept.
2. Update invitation status to `DECLINED`.
3. Audit log: `INVITATION_DECLINED`.
4. Notify org admins: "Dr. {name} declined the invitation."

### 13.4 Removing Members

```
DELETE /api/orgs/:orgId/members/:vetId
```

- Only ADMIN+ can remove members.
- OWNER cannot be removed.
- Admin cannot remove another admin (only OWNER can).
- On removal:
  - Membership status set to `REMOVED`.
  - `removedAt` timestamp set.
  - `removedBy` set to acting user's ID.
  - Removed vet loses access to all org data immediately.
  - Removed vet's existing treatment records remain (they are historical).
  - Email notification sent to removed vet.
  - Audit log: `MEMBER_REMOVED`.

### 13.5 Leaving an Organization

```
POST /api/orgs/:orgId/leave
```

- Any member can leave an organization voluntarily.
- OWNER **cannot** leave — they must transfer ownership first (V2) or delete the org.
- Membership status set to `LEFT`.
- Audit log: `MEMBER_LEFT`.

### 13.6 Changing Member Roles

```
PATCH /api/orgs/:orgId/members/:vetId/role
Body: { role: "ADMIN" }
```

- Only ADMIN+ can change roles.
- Cannot promote to OWNER (only one OWNER per org).
- Cannot demote OWNER.
- Admin cannot demote another admin (only OWNER can).
- Audit log: `MEMBER_ROLE_CHANGED`.

---

## 14. Client Management

### 14.1 What Is a Client?

A **client** is a pet owner or animal custodian who brings their animals to a veterinary organization for care. Clients are **not users of the platform** — they do not have accounts. They are records managed by vets within an organization.

### 14.2 Client Data Model

```
Client {
  id: UUID (PK)
  organizationId: UUID (FK → organizations.id)
  firstName: string
  lastName: string
  email: string?
  phoneNumber: string
  alternatePhone: string?
  address: string?
  city: string?
  state: string?
  notes: string?
  isActive: boolean (default: true)
  isDeleted: boolean (default: false)
  deletedAt: timestamp?
  deletedBy: UUID? (FK → vets.id)
  deletionReason: string?
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: UUID (FK → vets.id)
}
```

### 14.3 Client CRUD Operations

#### Create Client

```
POST /api/orgs/:orgId/clients
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `firstName` | string | Yes | Min 1, max 100 chars |
| `lastName` | string | Yes | Min 1, max 100 chars |
| `phoneNumber` | string | Yes | Valid phone format |
| `email` | string | No | Valid email format |
| `alternatePhone` | string | No | Valid phone format |
| `address` | string | No | Max 500 chars |
| `city` | string | No | Max 100 chars |
| `state` | string | No | Max 100 chars |
| `notes` | string | No | Max 2000 chars |

Backend processing:
1. Guards: Auth → Approval → Role (MEMBER+) → OrgScope
2. Validate fields.
3. Check for duplicate client within org: same `firstName` + `lastName` + `phoneNumber` → `409 "Client may already exist"` (warn, not block — allow override with `force: true`).
4. Create client record with `organizationId` from route param.
5. Set `createdBy` to authenticated vet's ID.
6. Audit log: `CLIENT_CREATED`.

#### Read Clients

```
GET /api/orgs/:orgId/clients
GET /api/orgs/:orgId/clients/:clientId
```

- List endpoint supports:
  - Pagination: `?page=1&limit=20`
  - Search: `?search=John` (searches firstName, lastName, phoneNumber, email)
  - Sort: `?sortBy=lastName&sortOrder=asc`
  - Filter: `?isActive=true`
- Single client endpoint includes animal count.

#### Update Client

```
PATCH /api/orgs/:orgId/clients/:clientId
```

- Partial updates allowed.
- Same validation as create.
- Audit log: `CLIENT_UPDATED`.

#### Deactivate Client

```
PATCH /api/orgs/:orgId/clients/:clientId/deactivate
```

- Soft deactivation — sets `isActive: false`.
- Client record is preserved for historical records.
- Client's animals and treatment records remain accessible (read-only).
- Audit log: `CLIENT_DEACTIVATED`.

#### Delete Client (Soft Delete — Permission Required)

```
DELETE /api/orgs/:orgId/clients/:clientId
Body: { "reason": "Duplicate record — merged into client XYZ" }
```

**This is a soft delete.** The record is never physically removed from the database.

**Prerequisites:**
- Vet must have `canDeleteClients: true` on their org membership (or be OWNER).
- `reason` field is **required** (min 10 characters) — every deletion must be justified.

**Backend processing:**
1. Guards: Auth → Approval → Role (MEMBER+) → OrgScope → **DeletePermissionGuard(`canDeleteClients`)**
2. Verify the client belongs to this organization.
3. Check if client has any animals:
   - If yes **and** none of the animals are deleted → return `409 "Cannot delete client with active animals. Delete or reassign animals first."`.
   - If all animals are already deleted → proceed.
4. Set `isDeleted: true`.
5. Set `deletedAt: now`.
6. Set `deletedBy: authenticated vet's ID`.
7. Set `deletionReason: reason from request`.
8. Set `isActive: false` (if not already).
9. **Cascade soft-delete** all associated animals that are not already deleted.
10. **Cascade soft-delete** all treatment records on those animals that are not already deleted.
11. Activity log: `CLIENT_DELETED` with vet name, client name, reason.
12. Audit log: `CLIENT_DELETED`.

**Important:**
- Deleted clients are **excluded from all list queries** by default (`WHERE isDeleted = false`).
- Admins can view deleted clients via `?includeDeleted=true` query parameter.
- Deleted clients **can be restored** by an OWNER or ADMIN (see Restore below).

#### Restore Deleted Client

```
POST /api/orgs/:orgId/clients/:clientId/restore
```

- Only OWNER or ADMIN can restore deleted records.
- Sets `isDeleted: false`, clears `deletedAt`, `deletedBy`, `deletionReason`.
- Does **not** automatically restore associated animals/treatments — those must be restored individually.
- Activity log: `CLIENT_RESTORED`.
- Audit log: `CLIENT_RESTORED`.

### 14.4 Client Access Rules

- Clients are **invisible** outside their organization.
- A query for clients **always** includes `WHERE organizationId = :orgId`.
- RLS policies enforce this at the database level.
- Cross-organization client access is **impossible** — even if someone constructs the right UUID, the RLS policy blocks it.

---

## 15. Animal Management

### 15.1 Animal Data Model

```
Animal {
  id: UUID (PK)
  organizationId: UUID (FK → organizations.id)
  clientId: UUID (FK → clients.id)
  name: string
  species: AnimalSpecies (enum)
  breed: string?
  color: string?
  gender: AnimalGender (enum)
  dateOfBirth: date?
  approximateAge: string?
  weight: decimal?
  weightUnit: WeightUnit (enum)
  microchipNumber: string?
  identifyingMarks: string?
  photoUrl: string?
  isAlive: boolean (default: true)
  isActive: boolean (default: true)
  isDeleted: boolean (default: false)
  deletedAt: timestamp?
  deletedBy: UUID? (FK → vets.id)
  deletionReason: string?
  notes: string?
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: UUID (FK → vets.id)
}
```

### 15.2 Enums

```
AnimalSpecies: DOG, CAT, HORSE, CATTLE, GOAT, SHEEP, PIG, POULTRY, RABBIT, FISH, BIRD, REPTILE, OTHER
AnimalGender: MALE, FEMALE, UNKNOWN
WeightUnit: KG, LBS
```

### 15.3 Animal CRUD Operations

#### Create Animal

```
POST /api/orgs/:orgId/animals
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `clientId` | UUID | Yes | Must exist in same organization |
| `name` | string | Yes | Min 1, max 100 chars |
| `species` | enum | Yes | Valid AnimalSpecies value |
| `breed` | string | No | Max 100 chars |
| `color` | string | No | Max 50 chars |
| `gender` | enum | Yes | Valid AnimalGender value |
| `dateOfBirth` | date | No | Must be past or today |
| `approximateAge` | string | No | E.g., "~3 years" — max 50 chars |
| `weight` | decimal | No | Min 0.01 |
| `weightUnit` | enum | No | KG or LBS; required if weight is provided |
| `microchipNumber` | string | No | Max 50 chars; unique within org |
| `identifyingMarks` | string | No | Max 500 chars |
| `notes` | string | No | Max 2000 chars |

Backend processing:
1. Guards: Auth → Approval → Role (MEMBER+) → OrgScope
2. Validate all fields.
3. Verify `clientId` exists and belongs to the same `organizationId` → `404 "Client not found"` if not.
4. If `microchipNumber` provided, check uniqueness within org → `409 "Microchip number already registered"`.
5. Create animal record.
6. Audit log: `ANIMAL_CREATED`.

#### Read Animals

```
GET /api/orgs/:orgId/animals
GET /api/orgs/:orgId/animals/:animalId
GET /api/orgs/:orgId/clients/:clientId/animals
```

- List supports pagination, search (name, species, breed, microchip), sort, filter.
- Client-scoped list returns only animals for that client.
- Single animal endpoint includes: owner (client) details, treatment count, last treatment date.

#### Update Animal

```
PATCH /api/orgs/:orgId/animals/:animalId
```

- Partial updates allowed.
- `clientId` **can** be changed (transfer animal to different client within same org).
- Audit log: `ANIMAL_UPDATED`.

#### Mark Animal as Deceased

```
PATCH /api/orgs/:orgId/animals/:animalId/deceased
Body: { dateOfDeath: "2026-01-15", causeOfDeath: "..." }
```

- Sets `isAlive: false`.
- Treatment records preserved.
- Activity log: `ANIMAL_DECEASED`.
- Audit log: `ANIMAL_DECEASED`.

#### Delete Animal (Soft Delete — Permission Required)

```
DELETE /api/orgs/:orgId/animals/:animalId
Body: { "reason": "Registered in error — duplicate of animal XYZ" }
```

**This is a soft delete.** The record is never physically removed from the database.

**Prerequisites:**
- Vet must have `canDeleteAnimals: true` on their org membership (or be OWNER).
- `reason` field is **required** (min 10 characters).

**Backend processing:**
1. Guards: Auth → Approval → Role (MEMBER+) → OrgScope → **DeletePermissionGuard(`canDeleteAnimals`)**
2. Verify the animal belongs to this organization.
3. Set `isDeleted: true`.
4. Set `deletedAt: now`.
5. Set `deletedBy: authenticated vet's ID`.
6. Set `deletionReason: reason from request`.
7. Set `isActive: false` (if not already).
8. **Cascade soft-delete** all treatment records for this animal that are not already deleted.
9. Activity log: `ANIMAL_DELETED` with vet name, animal name, species, client name, reason.
10. Audit log: `ANIMAL_DELETED`.

**Important:**
- Deleted animals are **excluded from all list queries** by default (`WHERE isDeleted = false`).
- Admins can view deleted animals via `?includeDeleted=true` query parameter.
- Deleted animals **can be restored** (see below).

#### Restore Deleted Animal

```
POST /api/orgs/:orgId/animals/:animalId/restore
```

- Only OWNER or ADMIN can restore deleted records.
- If the parent client is deleted → return `409 "Cannot restore animal — parent client is deleted. Restore the client first."`.
- Sets `isDeleted: false`, clears `deletedAt`, `deletedBy`, `deletionReason`.
- Does **not** automatically restore associated treatment records.
- Activity log: `ANIMAL_RESTORED`.
- Audit log: `ANIMAL_RESTORED`.

### 15.4 Referential Integrity

- Animals **cannot** exist without a client.
- The `clientId` foreign key is enforced at the database level with `ON DELETE RESTRICT`.
- Deleting a client cascades soft-deletion to all its non-deleted animals (and their treatments).
- Animals inherit organization scope from their client.

---

## 16. Medical Treatment & History

### 16.1 Overview

The treatment record system is the **core medical feature** of the platform. It is designed with the following principles:

- **Versioning:** Updates create new versions; previous versions are preserved.
- **Auditability:** Every action on a treatment record is logged with who, when, and what.
- **Accountability:** Every treatment is tied to the vet who administered/recorded it.
- **Permission-Gated Deletion:** Treatment records can be soft-deleted, but **only** by members who have been explicitly granted the `canDeleteTreatments` permission. Deleted records are preserved in the database and can be restored.

### 16.2 Treatment Record Data Model

```
TreatmentRecord {
  id: UUID (PK)
  organizationId: UUID (FK → organizations.id)
  animalId: UUID (FK → animals.id)
  vetId: UUID (FK → vets.id) -- the vet who created/administered
  version: integer (starts at 1)
  parentRecordId: UUID? (FK → treatment_records.id, self-reference for versioning)
  isLatestVersion: boolean (default: true)

  // Clinical Data
  visitDate: timestamp
  chiefComplaint: string
  history: string?
  clinicalFindings: string?
  diagnosis: string?
  differentialDiagnosis: string?
  treatmentGiven: string
  prescriptions: JSON? (structured: [{ drug, dosage, frequency, duration }])
  procedures: string?
  labResults: string?
  followUpDate: date?
  followUpNotes: string?
  weight: decimal?
  weightUnit: WeightUnit?
  temperature: decimal?
  temperatureUnit: TemperatureUnit?
  heartRate: integer?
  respiratoryRate: integer?
  bodyConditionScore: integer? (1-9 scale)

  // Metadata
  attachments: JSON? (array of { url, fileName, fileType })
  notes: string?
  status: TreatmentStatus

  // Soft Delete
  isDeleted: boolean (default: false)
  deletedAt: timestamp?
  deletedBy: UUID? (FK → vets.id)
  deletionReason: string?

  createdAt: timestamp
  updatedAt: timestamp
}
```

### 16.3 Treatment Status Enum

```
TreatmentStatus: COMPLETED, IN_PROGRESS, FOLLOW_UP_REQUIRED, REFERRED
```

### 16.4 Creating a Treatment Record

```
POST /api/orgs/:orgId/treatments
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `animalId` | UUID | Yes | Must exist in same org |
| `visitDate` | timestamp | Yes | Cannot be in the future |
| `chiefComplaint` | string | Yes | Min 5, max 2000 chars |
| `history` | string | No | Max 5000 chars |
| `clinicalFindings` | string | No | Max 5000 chars |
| `diagnosis` | string | No | Max 2000 chars |
| `differentialDiagnosis` | string | No | Max 2000 chars |
| `treatmentGiven` | string | Yes | Min 5, max 5000 chars |
| `prescriptions` | JSON | No | Array of { drug: string, dosage: string, frequency: string, duration: string } |
| `procedures` | string | No | Max 5000 chars |
| `labResults` | string | No | Max 5000 chars |
| `followUpDate` | date | No | Must be today or future |
| `followUpNotes` | string | No | Max 2000 chars |
| `weight` | decimal | No | Min 0.01 |
| `temperature` | decimal | No | Min 30, max 45 (Celsius) |
| `heartRate` | integer | No | Min 10, max 500 |
| `respiratoryRate` | integer | No | Min 2, max 200 |
| `bodyConditionScore` | integer | No | Min 1, max 9 |
| `status` | enum | Yes | Valid TreatmentStatus |
| `notes` | string | No | Max 5000 chars |

Backend processing:
1. Guards: Auth → Approval → Role (MEMBER+) → OrgScope
2. Validate all fields.
3. Verify `animalId` exists and belongs to same org → `404`.
4. Set `vetId` to authenticated vet (the vet creating the record is automatically the treating vet).
5. Set `version: 1`.
6. Set `isLatestVersion: true`.
7. Set `parentRecordId: null` (this is the original record).
8. Create the record.
9. Audit log: `TREATMENT_CREATED`.

### 16.5 Updating a Treatment Record (Versioning)

```
PUT /api/orgs/:orgId/treatments/:treatmentId
```

**This does NOT modify the existing record.** Instead:

1. The existing record's `isLatestVersion` is set to `false`.
2. A **new record** is created with:
   - Same `id` is NOT reused — it gets a new UUID.
   - `parentRecordId` = the original treatment record's ID.
   - `version` = previous version + 1.
   - `isLatestVersion` = true.
   - `vetId` = the vet making the edit (may differ from original vet).
   - All other fields from the request body (which includes the full updated data).
3. Audit log: `TREATMENT_UPDATED` with both old and new record IDs.

This ensures:
- The original record is **never modified**.
- A complete **version history** is maintained.
- It is always clear **who** made each version and **when**.

### 16.6 Reading Treatment Records

```
GET /api/orgs/:orgId/treatments
GET /api/orgs/:orgId/treatments/:treatmentId
GET /api/orgs/:orgId/animals/:animalId/treatments
GET /api/orgs/:orgId/treatments/:treatmentId/history
```

- **List endpoints** return only records where `isLatestVersion = true` by default.
- **Query params:** `?includeAllVersions=true` to see all versions.
- **History endpoint** returns all versions of a specific treatment, ordered by version descending.
- **Animal treatments** returns the full treatment timeline for an animal.
- Pagination, search (by diagnosis, complaint), sort (by visitDate), filter (by status, vet, date range) supported.

### 16.7 Deletion Policy (Soft Delete — Permission Required)

Treatment records can be soft-deleted, but **only** by members who have the `canDeleteTreatments` permission explicitly granted on their membership. This is a high-trust operation.

#### Delete Treatment Record

```
DELETE /api/orgs/:orgId/treatments/:treatmentId
Body: { "reason": "Recorded on wrong animal — correct record is treatment XYZ" }
```

**Prerequisites:**
- Vet must have `canDeleteTreatments: true` on their org membership (or be OWNER).
- `reason` field is **required** (min 10 characters) — every treatment deletion must be justified.

**Backend processing:**
1. Guards: Auth → Approval → Role (MEMBER+) → OrgScope → **DeletePermissionGuard(`canDeleteTreatments`)**
2. Verify the treatment record belongs to this organization.
3. If the treatment has child versions (i.e., it is a parent in the version chain):
   - **All versions in the chain are soft-deleted together** — you cannot delete a single version in isolation.
4. Set `isDeleted: true` on the record (and all its versions).
5. Set `deletedAt: now`.
6. Set `deletedBy: authenticated vet's ID`.
7. Set `deletionReason: reason from request`.
8. Activity log: `TREATMENT_DELETED` with vet name, animal name, diagnosis summary, reason.
9. Audit log: `TREATMENT_DELETED` with full metadata.

**Important:**
- Deleted treatment records are **excluded from all list queries** by default (`WHERE isDeleted = false`).
- Admins can view deleted treatments via `?includeDeleted=true` query parameter.
- The **original data is fully preserved** in the database — soft delete only hides the record from normal views.
- Deleted treatments **can be restored** (see below).

#### Restore Deleted Treatment Record

```
POST /api/orgs/:orgId/treatments/:treatmentId/restore
```

- Only OWNER or ADMIN can restore deleted treatment records.
- If the parent animal is deleted → return `409 "Cannot restore treatment — parent animal is deleted. Restore the animal first."`.
- Restores the entire version chain (all versions of the treatment).
- Sets `isDeleted: false`, clears `deletedAt`, `deletedBy`, `deletionReason` on all versions.
- Activity log: `TREATMENT_RESTORED`.
- Audit log: `TREATMENT_RESTORED`.

#### Why Soft Delete Instead of Hard Delete?

- **Compliance:** Medical records may be subject to regulatory retention requirements. Soft delete preserves the data while removing it from active views.
- **Accountability:** The audit trail captures who deleted what and why, enabling investigation of misuse.
- **Recovery:** Accidental deletions can be reversed by an admin.
- **Integrity:** Version chains remain intact even for deleted records.

### 16.8 Treatment Attachments

- Files (lab reports, X-rays, photos) can be attached to treatment records.
- Files are uploaded to Supabase Storage in a path like: `orgs/{orgId}/treatments/{treatmentId}/{fileName}`.
- Max file size: 10MB per file, 50MB total per treatment.
- Allowed file types: JPEG, PNG, PDF, DICOM (future).
- Attachment URLs are stored as JSON in the `attachments` column.
- When a treatment is soft-deleted, attachments **remain in storage** (they are not physically deleted). They become accessible again if the treatment is restored.

---

## 17. Notifications System

### 17.1 Notification Events

| Event | Recipients | Email | SMS |
|-------|-----------|-------|-----|
| `VET_PROFILE_SUBMITTED` | Master Admin(s) | Yes | No |
| `VET_APPROVED` | Vet | Yes | Yes |
| `VET_REJECTED` | Vet | Yes | Yes |
| `VET_SUSPENDED` | Vet | Yes | Yes |
| `VET_REACTIVATED` | Vet | Yes | Yes |
| `INVITATION_SENT` | Invited Vet | Yes | Yes (if phone available) |
| `INVITATION_ACCEPTED` | Org Admin(s) | Yes | No |
| `INVITATION_DECLINED` | Org Admin(s) | Yes | No |
| `MEMBER_REMOVED` | Removed Vet | Yes | Yes |
| `MEMBER_ROLE_CHANGED` | Affected Vet | Yes | No |
| `FOLLOW_UP_REMINDER` | Treating Vet | Yes | Yes |

### 17.2 Notification Architecture

```
Event occurs (e.g., VET_APPROVED)
  │
  ├─ 1. Service emits event via NestJS EventEmitter
  │
  ├─ 2. NotificationService listens for event
  │
  ├─ 3. NotificationService creates notification record in DB
  │     { id, recipientVetId, type, title, body, channel, status: PENDING }
  │
  ├─ 4. Email is sent via EmailService (Resend/SendGrid)
  │     ├── Success → status: SENT
  │     └── Failure → status: FAILED, retryCount++
  │
  ├─ 5. SMS is sent in parallel via SmsService (Twilio/Africa's Talking)
  │     ├── Success → status: SENT
  │     └── Failure → status: FAILED, retryCount++
  │
  └─ 6. If FAILED and retryCount < 3:
        └── Schedule retry with exponential backoff (1min, 5min, 15min)
```

### 17.3 Notification Data Model

```
Notification {
  id: UUID (PK)
  recipientVetId: UUID (FK → vets.id)
  type: NotificationType (enum matching event names)
  title: string
  body: string
  channel: ENUM(EMAIL, SMS, BOTH)
  emailStatus: ENUM(PENDING, SENT, FAILED, NOT_APPLICABLE)
  smsStatus: ENUM(PENDING, SENT, FAILED, NOT_APPLICABLE)
  emailSentAt: timestamp?
  smsSentAt: timestamp?
  retryCount: integer (default: 0)
  metadata: JSON? (contextual data like orgName, reason, etc.)
  createdAt: timestamp
}
```

### 17.4 Email Templates

All emails use a consistent branded template with:
- Platform logo header
- Personalized greeting: "Hello Dr. {lastName},"
- Clear action message
- Call-to-action button (where applicable)
- Footer with support contact info and unsubscribe link

### 17.5 SMS Templates

SMS messages are concise (max 160 chars):
- "VetReg: Your account has been approved. Log in at [url]"
- "VetReg: You've been invited to join {orgName}. Check your email."
- "VetReg: Your account has been suspended. Contact support."

### 17.6 In-App Notifications (V1.5)

Future enhancement: Real-time in-app notifications via Supabase Realtime subscriptions. The database model is designed to support this — the `Notification` table can be queried by the frontend to display a notification bell with unread count.

---

## 17A. Organization Activity Log

The Organization Activity Log is a **dedicated, organization-scoped feed** that provides full visibility into who did what within the organization. Unlike the global Audit Log (Section 25) which is primarily for platform-level compliance and Master Admin review, the Activity Log is **designed for day-to-day organizational oversight** and is accessible **only to the OWNER** of the organization by default. ADMIN roles can be granted explicit access via the `canViewActivityLog` permission.

### 17A.1 Purpose

- Enable org owners (and authorized admins) to see a **chronological feed** of all actions taken within their organization.
- Provide **accountability** — owners can see who created, edited, or deleted records.
- Help org owners **monitor activity patterns**, detect anomalies, and investigate issues.
- Serve as an **oversight tool** — owners can review team activity and enforce organizational policies.
- ADMIN access is **optional** and must be explicitly granted by the OWNER.

### 17A.2 Activity Log Data Model

```
ActivityLog {
  id: UUID (PK)
  organizationId: UUID (FK → organizations.id)
  vetId: UUID (FK → vets.id) -- the vet who performed the action
  action: ActivityAction (enum)
  entityType: ActivityEntityType (enum)
  entityId: UUID?
  description: string -- human-readable description, e.g., "Dr. Jane Smith deleted client John Doe"
  metadata: JSON? -- structured context data
  createdAt: timestamp
}
```

### 17A.3 Activity Action Enum

```
ActivityAction:
  // Client actions
  CLIENT_CREATED
  CLIENT_UPDATED
  CLIENT_DEACTIVATED
  CLIENT_REACTIVATED
  CLIENT_DELETED
  CLIENT_RESTORED

  // Animal actions
  ANIMAL_CREATED
  ANIMAL_UPDATED
  ANIMAL_DECEASED
  ANIMAL_DELETED
  ANIMAL_RESTORED

  // Treatment actions
  TREATMENT_CREATED
  TREATMENT_UPDATED
  TREATMENT_DELETED
  TREATMENT_RESTORED

  // Membership actions
  MEMBER_JOINED
  MEMBER_LEFT
  MEMBER_REMOVED
  MEMBER_ROLE_CHANGED
  MEMBER_PERMISSIONS_UPDATED

  // Invitation actions
  INVITATION_SENT
  INVITATION_ACCEPTED
  INVITATION_DECLINED
  INVITATION_CANCELLED

  // Organization actions
  ORGANIZATION_UPDATED
```

### 17A.4 Activity Entity Type Enum

```
ActivityEntityType: CLIENT, ANIMAL, TREATMENT, MEMBER, INVITATION, ORGANIZATION
```

### 17A.5 How Activity Logs Are Created

Activity logs are created **automatically** by backend services whenever a state-changing action occurs within an organization. The `ActivityLogService` is called by every relevant service (ClientService, AnimalService, TreatmentService, MembershipService, etc.) as the final step of each operation.

Each activity log entry includes:
- **Who:** The vet who performed the action (`vetId`).
- **What:** The action type and a human-readable description.
- **When:** Timestamp of the action.
- **On What:** The entity type and ID affected.
- **Context:** Metadata with additional details (e.g., reason for deletion, old/new values).

### 17A.6 Example Activity Log Entries

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "vetId": "uuid",
  "action": "CLIENT_DELETED",
  "entityType": "CLIENT",
  "entityId": "uuid",
  "description": "Dr. Jane Smith deleted client John Doe. Reason: Duplicate record.",
  "metadata": {
    "clientName": "John Doe",
    "reason": "Duplicate record — merged into client XYZ",
    "animalsCascadeDeleted": 2,
    "treatmentsCascadeDeleted": 5
  },
  "createdAt": "2026-02-08T14:30:00.000Z"
}
```

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "vetId": "uuid",
  "action": "MEMBER_PERMISSIONS_UPDATED",
  "entityType": "MEMBER",
  "entityId": "uuid (target member's vet ID)",
  "description": "Dr. Admin granted delete permissions to Dr. New Vet (clients, animals).",
  "metadata": {
    "targetVetName": "Dr. New Vet",
    "changes": {
      "canDeleteClients": { "from": false, "to": true },
      "canDeleteAnimals": { "from": false, "to": true },
      "canDeleteTreatments": { "from": false, "to": false }
    }
  },
  "createdAt": "2026-02-08T10:15:00.000Z"
}
```

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "vetId": "uuid",
  "action": "TREATMENT_CREATED",
  "entityType": "TREATMENT",
  "entityId": "uuid",
  "description": "Dr. Jane Smith created a treatment record for Buddy (Dog) — Diagnosis: Parvovirus.",
  "metadata": {
    "animalName": "Buddy",
    "species": "DOG",
    "clientName": "John Doe",
    "diagnosis": "Parvovirus",
    "treatmentStatus": "IN_PROGRESS"
  },
  "createdAt": "2026-02-08T09:00:00.000Z"
}
```

### 17A.7 API Endpoints

```
GET /api/orgs/:orgId/activity-log
```

**Auth:** Yes | **Approval:** Yes | **Role:** MEMBER+ | **Org Scope:** Yes | **Special:** Requires `role = OWNER` OR `canViewActivityLog = true`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Items per page (max 100) |
| `action` | string | — | Filter by action type (e.g., `CLIENT_DELETED`) |
| `entityType` | string | — | Filter by entity type (e.g., `TREATMENT`) |
| `vetId` | UUID | — | Filter by acting vet |
| `startDate` | ISO date | — | Activity after this date |
| `endDate` | ISO date | — | Activity before this date |
| `search` | string | — | Full-text search on description |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "CLIENT_DELETED",
      "entityType": "CLIENT",
      "entityId": "uuid",
      "description": "Dr. Jane Smith deleted client John Doe. Reason: Duplicate record.",
      "metadata": { ... },
      "vet": {
        "id": "uuid",
        "fullName": "Dr. Jane Smith",
        "profilePhotoUrl": "..."
      },
      "createdAt": "2026-02-08T14:30:00.000Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 50, "total": 234, "totalPages": 5 }
  }
}
```

### 17A.8 Activity Log vs. Audit Log

| Aspect | Activity Log | Audit Log |
|--------|-------------|-----------|
| **Scope** | Per-organization | Platform-wide |
| **Audience** | OWNER (+ ADMINs with explicit grant) | Master Admins + Org Admins |
| **Purpose** | Day-to-day oversight | Compliance & investigation |
| **Content** | Human-readable descriptions | Structured technical metadata |
| **Includes** | Org-level actions only | All system actions (including auth, admin) |
| **Access** | OWNER or canViewActivityLog permission | ADMIN+ / MASTER_ADMIN |
| **Retention** | Same as audit logs (never deleted) | Never deleted |

### 17A.9 Frontend — Activity Log Page

**Route:** `/dashboard/activity`

**UI Layout:**
- Chronological feed (newest first) with infinite scroll or pagination.
- Each entry shows:
  - Vet avatar + name
  - Action description (human-readable)
  - Timestamp (relative, e.g., "2 hours ago", with exact time on hover)
  - Entity link (clickable — navigates to the affected client/animal/treatment)
  - Action badge (color-coded: green for create, blue for update, red for delete, yellow for restore)
- **Filter bar** at the top:
  - Action type dropdown
  - Entity type dropdown
  - Member dropdown
  - Date range picker
  - Search field
- **Empty state:** "No activity yet. Actions performed within this organization will appear here."

### 17A.10 Activity Log Retention & Performance

- Activity logs are **never deleted** — they serve as a permanent organizational record.
- The `activity_logs` table has indexes on:
  - `organization_id, created_at DESC` (primary query pattern)
  - `organization_id, action` (filtered queries)
  - `organization_id, entity_type, entity_id` (entity-specific history)
  - `organization_id, vet_id` (per-member history)
- For organizations with high activity volume, older entries are paginated and lazy-loaded.

---

## 18. Account Suspension & Enforcement

### 18.1 Suspension

**Endpoint:** `POST /api/admin/vets/:vetId/suspend`

**Body:**
```json
{
  "reason": "Violation of platform terms - fraudulent VCN",
  "notifyVet": true
}
```

**Backend Processing:**

1. Verify acting user is Master Admin.
2. Verify target vet exists and is currently `APPROVED`.
3. Update vet status to `SUSPENDED`.
4. Set `suspendedAt` timestamp.
5. Set `suspendedBy` = acting admin's ID.
6. Set `suspensionReason`.
7. **Invalidate all active sessions:**
   - Call Supabase Admin API to sign out the user: `supabase.auth.admin.signOut(authUserId)`
   - This immediately revokes all active tokens.
8. The vet's next request will fail at the `ApprovalGuard` with: `403 "Account suspended: {reason}"`.
9. All organization memberships remain intact but the vet cannot access any org data.
10. If `notifyVet: true`:
    - Email: "Your VetReg account has been suspended. Reason: {reason}. Contact support at [email]."
    - SMS: "VetReg: Your account has been suspended. Check your email for details."
11. Audit log: `VET_SUSPENDED`.

### 18.2 Reactivation

**Endpoint:** `POST /api/admin/vets/:vetId/reactivate`

**Backend Processing:**

1. Verify acting user is Master Admin.
2. Verify target vet is currently `SUSPENDED`.
3. Update vet status to `APPROVED`.
4. Clear `suspendedAt`, `suspendedBy`, `suspensionReason`.
5. Set `reactivatedAt` timestamp.
6. Set `reactivatedBy` = acting admin's ID.
7. Vet can now log in and access the platform normally.
8. Email + SMS notification: "Your VetReg account has been reactivated."
9. Audit log: `VET_REACTIVATED`.

### 18.3 Impact of Suspension

| Area | Impact |
|------|--------|
| API Access | All protected endpoints return 403 |
| Active Sessions | Immediately invalidated |
| Organization Memberships | Preserved but inaccessible |
| Treatment Records | Preserved and accessible to other org members |
| Client/Animal Data | Preserved and accessible to other org members |
| Invitations | Cannot accept new invitations while suspended |

---

## 19. Security Enforcement Model

### 19.1 Defense in Depth

Security is enforced at **every layer** of the stack:

```
Layer 1: Network (HTTPS/TLS, CORS, Rate Limiting)
Layer 2: Authentication (JWT validation)
Layer 3: Authorization (Approval status, Role, Org scope)
Layer 4: Input Validation (DTO validation, sanitization)
Layer 5: Database (RLS policies, foreign keys, constraints)
Layer 6: Audit (Comprehensive logging of all actions)
```

### 19.2 CORS Configuration

```typescript
{
  origin: ['https://vetreg.com', 'https://www.vetreg.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
  maxAge: 86400 // 24 hours
}
```

### 19.3 Rate Limiting

| Endpoint Group | Rate Limit | Window |
|---------------|-----------|--------|
| Auth endpoints | 10 requests | 1 minute |
| Profile submission | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Admin endpoints | 50 requests | 1 minute |
| File uploads | 10 requests | 1 minute |

### 19.4 Input Sanitization

- All string inputs are trimmed.
- HTML tags are stripped from all text fields.
- SQL injection is prevented by Prisma's parameterized queries.
- XSS is prevented by HTML stripping + React's default escaping.
- File uploads are validated for MIME type (not just extension).

### 19.5 Data Access Control Summary

```
Can Vet X access Resource Y in Org Z?

1. Is Vet X authenticated? (valid JWT)
   └── No → 401

2. Is Vet X approved? (vet.status === APPROVED)
   └── No → 403

3. Is Vet X a member of Org Z? (active membership exists)
   └── No → 403

4. Does Vet X's role permit this action?
   └── No → 403

5. [If DELETE action] Does Vet X have the specific delete permission?
   └── No → 403 "You do not have permission to delete this resource"

6. Does Resource Y belong to Org Z?
   └── No → 404 (intentionally 404, not 403, to avoid leaking existence)

7. ✅ Access granted
```

### 19.6 Sensitive Data Handling

- Passwords: Not applicable (Google OAuth only).
- VCN numbers: Stored in plaintext (they are professional identifiers, not secrets).
- Phone numbers: Stored in plaintext; displayed masked in UI (e.g., +234***5678).
- Emails: Stored in plaintext; tied to Google account.
- Medical records: Encrypted at rest (Supabase default encryption).
- File uploads: Stored in private Supabase Storage buckets; accessed via signed URLs with 1-hour expiry.

---

## 20. Database Schema Design

### 20.1 Entity Relationship Diagram

```
┌──────────────────┐     ┌──────────────────────┐
│    auth.users     │     │       vets            │
│  (Supabase Auth)  │────▶│  id (PK)              │
│                   │  1:1│  authUserId (FK,UQ)    │
│  id               │     │  email (UQ)            │
│  email             │     │  fullName              │
│                   │     │  phoneNumber            │
└──────────────────┘     │  vcnNumber (UQ)        │
                          │  status (enum)          │
                          │  isMasterAdmin          │
                          │  profileCompleted       │
                          │  ...                    │
                          └────────┬───────────────┘
                                   │
                    ┌──────────────┼───────────────────┐
                    │              │                     │
                    ▼              ▼                     ▼
          ┌────────────────┐ ┌────────────┐  ┌───────────────────┐
          │ org_memberships │ │organizations│  │  notifications    │
          │ id (PK)         │ │ id (PK)     │  │  id (PK)          │
          │ vetId (FK)      │ │ name        │  │  recipientVetId   │
          │ organizationId  │ │ slug (UQ)   │  │  type              │
          │ role (enum)     │ │ address     │  │  channel            │
          │ status (enum)   │ │ createdBy   │  │  emailStatus       │
          │                 │ │ ...         │  │  smsStatus          │
          └────────────────┘ └──────┬──────┘  └───────────────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                 │
                    ▼               ▼                 ▼
            ┌──────────┐   ┌──────────────┐  ┌──────────────┐
            │ clients   │   │ invitations   │  │ audit_logs   │
            │ id (PK)   │   │ id (PK)       │  │ id (PK)      │
            │ orgId(FK) │   │ orgId (FK)    │  │ vetId (FK)   │
            │ firstName │   │ invitedEmail  │  │ action       │
            │ lastName  │   │ role          │  │ entityType   │
            │ phone     │   │ token (UQ)    │  │ entityId     │
            │ ...       │   │ status        │  │ metadata     │
            └─────┬────┘   │ expiresAt     │  │ ipAddress    │
                  │         └──────────────┘  │ createdAt    │
                  │                            └──────────────┘
                  ▼
            ┌──────────┐
            │ animals   │
            │ id (PK)   │
            │ clientId  │
            │ orgId(FK) │
            │ name      │
            │ species   │
            │ breed     │
            │ ...       │
            └─────┬────┘
                  │
                  ▼
       ┌──────────────────┐
       │ treatment_records │
       │ id (PK)           │
       │ animalId (FK)     │
       │ orgId (FK)        │
       │ vetId (FK)        │
       │ version           │
       │ parentRecordId    │
       │ isLatestVersion   │
       │ chiefComplaint    │
       │ diagnosis         │
       │ treatmentGiven    │
       │ ...               │
       └──────────────────┘
```

### 20.2 Table Definitions (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum VetStatus {
  PENDING_APPROVAL
  APPROVED
  REJECTED
  SUSPENDED
}

enum OrgType {
  CLINIC
  HOSPITAL
  MOBILE_PRACTICE
  RESEARCH_LAB
  OTHER
}

enum MembershipRole {
  OWNER
  ADMIN
  MEMBER
}

enum MembershipStatus {
  ACTIVE
  REMOVED
  LEFT
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
}

enum AnimalSpecies {
  DOG
  CAT
  HORSE
  CATTLE
  GOAT
  SHEEP
  PIG
  POULTRY
  RABBIT
  FISH
  BIRD
  REPTILE
  OTHER
}

enum AnimalGender {
  MALE
  FEMALE
  UNKNOWN
}

enum WeightUnit {
  KG
  LBS
}

enum TemperatureUnit {
  CELSIUS
  FAHRENHEIT
}

enum TreatmentStatus {
  COMPLETED
  IN_PROGRESS
  FOLLOW_UP_REQUIRED
  REFERRED
}

enum NotificationType {
  VET_PROFILE_SUBMITTED
  VET_APPROVED
  VET_REJECTED
  VET_SUSPENDED
  VET_REACTIVATED
  INVITATION_SENT
  INVITATION_ACCEPTED
  INVITATION_DECLINED
  MEMBER_REMOVED
  MEMBER_ROLE_CHANGED
  FOLLOW_UP_REMINDER
}

enum NotificationChannel {
  EMAIL
  SMS
  BOTH
}

enum DeliveryStatus {
  PENDING
  SENT
  FAILED
  NOT_APPLICABLE
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum PracticeType {
  SMALL_ANIMAL
  LARGE_ANIMAL
  MIXED
  EXOTIC
  EQUINE
  AVIAN
  OTHER
}

model Vet {
  id                  String    @id @default(uuid())
  authUserId          String    @unique @map("auth_user_id")
  email               String    @unique
  fullName            String?   @map("full_name")
  phoneNumber         String?   @map("phone_number")
  dateOfBirth         DateTime? @map("date_of_birth")
  gender              Gender?
  profilePhotoUrl     String?   @map("profile_photo_url")

  // Professional
  vcnNumber           String?   @unique @map("vcn_number")
  specialization      String?
  yearsOfExperience   Int?      @map("years_of_experience")
  qualifications      String[]  @default([])
  universityAttended  String?   @map("university_attended")
  graduationYear      Int?      @map("graduation_year")

  // Practice
  practiceAddress     String?   @map("practice_address")
  city                String?
  state               String?
  country             String?   @default("NG")
  practiceType        PracticeType? @map("practice_type")

  // Status
  status              VetStatus @default(PENDING_APPROVAL)
  profileCompleted    Boolean   @default(false) @map("profile_completed")
  profileSubmittedAt  DateTime? @map("profile_submitted_at")
  approvedAt          DateTime? @map("approved_at")
  approvedBy          String?   @map("approved_by")
  rejectedAt          DateTime? @map("rejected_at")
  rejectedBy          String?   @map("rejected_by")
  rejectionReason     String?   @map("rejection_reason")
  suspendedAt         DateTime? @map("suspended_at")
  suspendedBy         String?   @map("suspended_by")
  suspensionReason    String?   @map("suspension_reason")
  reactivatedAt       DateTime? @map("reactivated_at")
  reactivatedBy       String?   @map("reactivated_by")

  // Platform
  isMasterAdmin       Boolean   @default(false) @map("is_master_admin")

  // Metadata
  googleDisplayName   String?   @map("google_display_name")
  googleAvatarUrl     String?   @map("google_avatar_url")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // Relations
  memberships         OrgMembership[]
  createdOrgs         Organization[]  @relation("OrgCreator")
  treatments          TreatmentRecord[]
  notifications       Notification[]
  auditLogs           AuditLog[]
  activityLogs        ActivityLog[]
  createdClients      Client[]        @relation("ClientCreator")
  createdAnimals      Animal[]        @relation("AnimalCreator")
  sentInvitations     Invitation[]    @relation("InvitationSender")

  @@map("vets")
}

model Organization {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  description   String?
  address       String
  city          String
  state         String
  country       String   @default("NG")
  phoneNumber   String   @map("phone_number")
  email         String?
  website       String?
  logoUrl       String?  @map("logo_url")
  type          OrgType  @default(CLINIC)
  isActive      Boolean  @default(true) @map("is_active")

  createdBy     String   @map("created_by")
  creator       Vet      @relation("OrgCreator", fields: [createdBy], references: [id])
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  memberships   OrgMembership[]
  clients       Client[]
  animals       Animal[]
  treatments    TreatmentRecord[]
  invitations   Invitation[]
  activityLogs  ActivityLog[]

  @@map("organizations")
}

model OrgMembership {
  id              String           @id @default(uuid())
  vetId           String           @map("vet_id")
  organizationId  String           @map("organization_id")
  role            MembershipRole   @default(MEMBER)
  status          MembershipStatus @default(ACTIVE)
  joinedAt        DateTime         @default(now()) @map("joined_at")
  removedAt       DateTime?        @map("removed_at")
  removedBy       String?          @map("removed_by")

  // Granular permissions (must be explicitly granted, except for OWNER)
  canDeleteClients    Boolean      @default(false) @map("can_delete_clients")
  canDeleteAnimals    Boolean      @default(false) @map("can_delete_animals")
  canDeleteTreatments Boolean      @default(false) @map("can_delete_treatments")
  canViewActivityLog  Boolean      @default(false) @map("can_view_activity_log")

  vet             Vet              @relation(fields: [vetId], references: [id])
  organization    Organization     @relation(fields: [organizationId], references: [id])

  @@unique([vetId, organizationId])
  @@map("org_memberships")
}

model Invitation {
  id              String           @id @default(uuid())
  organizationId  String           @map("organization_id")
  invitedEmail    String           @map("invited_email")
  role            MembershipRole   @default(MEMBER)
  token           String           @unique @default(uuid())
  status          InvitationStatus @default(PENDING)
  invitedBy       String           @map("invited_by")
  expiresAt       DateTime         @map("expires_at")
  respondedAt     DateTime?        @map("responded_at")

  organization    Organization     @relation(fields: [organizationId], references: [id])
  inviter         Vet              @relation("InvitationSender", fields: [invitedBy], references: [id])

  createdAt       DateTime         @default(now()) @map("created_at")

  @@unique([organizationId, invitedEmail, status])
  @@map("invitations")
}

model Client {
  id              String    @id @default(uuid())
  organizationId  String    @map("organization_id")
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")
  email           String?
  phoneNumber     String    @map("phone_number")
  alternatePhone  String?   @map("alternate_phone")
  address         String?
  city            String?
  state           String?
  notes           String?
  isActive        Boolean   @default(true) @map("is_active")

  // Soft delete
  isDeleted       Boolean   @default(false) @map("is_deleted")
  deletedAt       DateTime? @map("deleted_at")
  deletedBy       String?   @map("deleted_by")
  deletionReason  String?   @map("deletion_reason")

  createdBy       String    @map("created_by")
  creator         Vet       @relation("ClientCreator", fields: [createdBy], references: [id])
  organization    Organization @relation(fields: [organizationId], references: [id])
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  animals         Animal[]

  @@index([organizationId, isDeleted])
  @@map("clients")
}

model Animal {
  id               String        @id @default(uuid())
  organizationId   String        @map("organization_id")
  clientId         String        @map("client_id")
  name             String
  species          AnimalSpecies
  breed            String?
  color            String?
  gender           AnimalGender  @default(UNKNOWN)
  dateOfBirth      DateTime?     @map("date_of_birth")
  approximateAge   String?       @map("approximate_age")
  weight           Decimal?
  weightUnit       WeightUnit?   @map("weight_unit")
  microchipNumber  String?       @map("microchip_number")
  identifyingMarks String?       @map("identifying_marks")
  photoUrl         String?       @map("photo_url")
  isAlive          Boolean       @default(true) @map("is_alive")
  isActive         Boolean       @default(true) @map("is_active")
  dateOfDeath      DateTime?     @map("date_of_death")
  causeOfDeath     String?       @map("cause_of_death")
  notes            String?

  // Soft delete
  isDeleted        Boolean       @default(false) @map("is_deleted")
  deletedAt        DateTime?     @map("deleted_at")
  deletedBy        String?       @map("deleted_by")
  deletionReason   String?       @map("deletion_reason")

  createdBy        String        @map("created_by")
  creator          Vet           @relation("AnimalCreator", fields: [createdBy], references: [id])
  client           Client        @relation(fields: [clientId], references: [id], onDelete: Restrict)
  organization     Organization  @relation(fields: [organizationId], references: [id])
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")

  // Relations
  treatments       TreatmentRecord[]

  @@unique([organizationId, microchipNumber])
  @@index([organizationId, isDeleted])
  @@map("animals")
}

model TreatmentRecord {
  id                    String          @id @default(uuid())
  organizationId        String          @map("organization_id")
  animalId              String          @map("animal_id")
  vetId                 String          @map("vet_id")
  version               Int             @default(1)
  parentRecordId        String?         @map("parent_record_id")
  isLatestVersion       Boolean         @default(true) @map("is_latest_version")

  // Clinical
  visitDate             DateTime        @map("visit_date")
  chiefComplaint        String          @map("chief_complaint")
  history               String?
  clinicalFindings      String?         @map("clinical_findings")
  diagnosis             String?
  differentialDiagnosis String?         @map("differential_diagnosis")
  treatmentGiven        String          @map("treatment_given")
  prescriptions         Json?
  procedures            String?
  labResults            String?         @map("lab_results")
  followUpDate          DateTime?       @map("follow_up_date")
  followUpNotes         String?         @map("follow_up_notes")
  weight                Decimal?
  weightUnit            WeightUnit?     @map("weight_unit")
  temperature           Decimal?
  temperatureUnit       TemperatureUnit? @map("temperature_unit")
  heartRate             Int?            @map("heart_rate")
  respiratoryRate       Int?            @map("respiratory_rate")
  bodyConditionScore    Int?            @map("body_condition_score")
  attachments           Json?
  notes                 String?
  status                TreatmentStatus @default(COMPLETED)

  // Soft delete
  isDeleted             Boolean         @default(false) @map("is_deleted")
  deletedAt             DateTime?       @map("deleted_at")
  deletedBy             String?         @map("deleted_by")
  deletionReason        String?         @map("deletion_reason")

  // Metadata
  createdAt             DateTime        @default(now()) @map("created_at")
  updatedAt             DateTime        @updatedAt @map("updated_at")

  // Relations
  animal                Animal          @relation(fields: [animalId], references: [id])
  vet                   Vet             @relation(fields: [vetId], references: [id])
  organization          Organization    @relation(fields: [organizationId], references: [id])
  parentRecord          TreatmentRecord? @relation("TreatmentVersions", fields: [parentRecordId], references: [id])
  childVersions         TreatmentRecord[] @relation("TreatmentVersions")

  @@index([organizationId, isDeleted])
  @@map("treatment_records")
}

model Notification {
  id              String              @id @default(uuid())
  recipientVetId  String              @map("recipient_vet_id")
  type            NotificationType
  title           String
  body            String
  channel         NotificationChannel
  emailStatus     DeliveryStatus      @default(PENDING) @map("email_status")
  smsStatus       DeliveryStatus      @default(PENDING) @map("sms_status")
  emailSentAt     DateTime?           @map("email_sent_at")
  smsSentAt       DateTime?           @map("sms_sent_at")
  retryCount      Int                 @default(0) @map("retry_count")
  metadata        Json?
  isRead          Boolean             @default(false) @map("is_read")

  recipientVet    Vet                 @relation(fields: [recipientVetId], references: [id])
  createdAt       DateTime            @default(now()) @map("created_at")

  @@map("notifications")
}

model AuditLog {
  id          String   @id @default(uuid())
  vetId       String?  @map("vet_id")
  action      String
  entityType  String   @map("entity_type")
  entityId    String?  @map("entity_id")
  metadata    Json?
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")

  vet         Vet?     @relation(fields: [vetId], references: [id])
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([vetId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}

model ActivityLog {
  id              String       @id @default(uuid())
  organizationId  String       @map("organization_id")
  vetId           String       @map("vet_id")
  action          String
  entityType      String       @map("entity_type")
  entityId        String?      @map("entity_id")
  description     String       // Human-readable description
  metadata        Json?

  organization    Organization @relation(fields: [organizationId], references: [id])
  vet             Vet          @relation(fields: [vetId], references: [id])
  createdAt       DateTime     @default(now()) @map("created_at")

  @@index([organizationId, createdAt(sort: Desc)])
  @@index([organizationId, action])
  @@index([organizationId, entityType, entityId])
  @@index([organizationId, vetId])
  @@map("activity_logs")
}
```

### 20.3 Database Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `vets` | `auth_user_id` (unique) | Fast lookup by Supabase auth user |
| `vets` | `email` (unique) | Prevent duplicate emails |
| `vets` | `vcn_number` (unique) | Prevent duplicate VCNs |
| `vets` | `status` | Filter by approval status |
| `org_memberships` | `(vet_id, organization_id)` (unique) | Prevent duplicate memberships |
| `org_memberships` | `organization_id, status` | List active members of an org |
| `clients` | `organization_id` | Org-scoped queries |
| `clients` | `organization_id, first_name, last_name` | Duplicate detection |
| `animals` | `organization_id` | Org-scoped queries |
| `animals` | `client_id` | Animals by client |
| `animals` | `(organization_id, microchip_number)` (unique) | Unique microchip per org |
| `treatment_records` | `animal_id, is_latest_version` | Latest treatments per animal |
| `treatment_records` | `organization_id` | Org-scoped queries |
| `treatment_records` | `parent_record_id` | Version chain traversal |
| `treatment_records` | `vet_id` | Treatments by vet |
| `audit_logs` | `vet_id` | Logs by user |
| `audit_logs` | `(entity_type, entity_id)` | Logs by entity |
| `audit_logs` | `action` | Logs by action type |
| `audit_logs` | `created_at` | Time-based queries |
| `clients` | `organization_id, is_deleted` | Exclude deleted from queries |
| `animals` | `organization_id, is_deleted` | Exclude deleted from queries |
| `treatment_records` | `organization_id, is_deleted` | Exclude deleted from queries |
| `notifications` | `recipient_vet_id, is_read` | Unread notifications |
| `invitations` | `token` (unique) | Invitation acceptance |
| `invitations` | `(organization_id, invited_email, status)` (unique) | Prevent duplicate pending invites |
| `activity_logs` | `organization_id, created_at DESC` | Primary query (chronological feed) |
| `activity_logs` | `organization_id, action` | Filtered queries |
| `activity_logs` | `organization_id, entity_type, entity_id` | Entity-specific history |
| `activity_logs` | `organization_id, vet_id` | Per-member history |

---

## 21. API Design & Endpoints

### 21.1 Base URL

```
Production:  https://api.vetreg.com/v1
Staging:     https://api-staging.vetreg.com/v1
Development: http://localhost:3001/v1
```

### 21.2 Complete Endpoint Reference

#### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/me` | Yes | Get current user's vet profile and status |
| POST | `/auth/logout` | Yes | Sign out and invalidate session |

#### Vet Profile

| Method | Endpoint | Auth | Approval | Description |
|--------|----------|------|----------|-------------|
| POST | `/vets/profile` | Yes | No | Submit/update vet profile (onboarding) |
| GET | `/vets/profile` | Yes | No | Get own vet profile |
| PATCH | `/vets/profile` | Yes | No | Update profile fields |

#### Master Admin — Vet Management

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/admin/vets` | Yes | MASTER_ADMIN | List all vets (with filtering by status) |
| GET | `/admin/vets/:vetId` | Yes | MASTER_ADMIN | Get vet details |
| POST | `/admin/vets/:vetId/approve` | Yes | MASTER_ADMIN | Approve a vet |
| POST | `/admin/vets/:vetId/reject` | Yes | MASTER_ADMIN | Reject a vet (with reason) |
| POST | `/admin/vets/:vetId/suspend` | Yes | MASTER_ADMIN | Suspend a vet (with reason) |
| POST | `/admin/vets/:vetId/reactivate` | Yes | MASTER_ADMIN | Reactivate a suspended vet |
| GET | `/admin/stats` | Yes | MASTER_ADMIN | Platform-wide statistics |

#### Organizations

| Method | Endpoint | Auth | Approval | Role | Description |
|--------|----------|------|----------|------|-------------|
| POST | `/orgs` | Yes | Yes | — | Create a new organization |
| GET | `/orgs` | Yes | Yes | — | List orgs the vet belongs to |
| GET | `/orgs/:orgId` | Yes | Yes | MEMBER+ | Get org details |
| PATCH | `/orgs/:orgId` | Yes | Yes | ADMIN+ | Update org details |
| GET | `/orgs/:orgId/stats` | Yes | Yes | MEMBER+ | Org-level statistics |

#### Organization Memberships

| Method | Endpoint | Auth | Approval | Role | Description |
|--------|----------|------|----------|------|-------------|
| GET | `/orgs/:orgId/members` | Yes | Yes | MEMBER+ | List org members (includes permission flags) |
| DELETE | `/orgs/:orgId/members/:vetId` | Yes | Yes | ADMIN+ | Remove a member |
| PATCH | `/orgs/:orgId/members/:vetId/role` | Yes | Yes | ADMIN+ | Change member role |
| PATCH | `/orgs/:orgId/members/:vetId/permissions` | Yes | Yes | OWNER | Grant/revoke permissions (delete + activity log) |
| GET | `/orgs/:orgId/members/:vetId/permissions` | Yes | Yes | OWNER | Get member's permission flags |
| POST | `/orgs/:orgId/leave` | Yes | Yes | MEMBER+ | Leave the organization |

#### Organization Activity Log

| Method | Endpoint | Auth | Approval | Role | Special | Description |
|--------|----------|------|----------|------|---------|-------------|
| GET | `/orgs/:orgId/activity-log` | Yes | Yes | MEMBER+ | OWNER or `canViewActivityLog` | List org activity (paginated, filterable) |

#### Invitations

| Method | Endpoint | Auth | Approval | Role | Description |
|--------|----------|------|----------|------|-------------|
| POST | `/orgs/:orgId/invitations` | Yes | Yes | ADMIN+ | Send invitation |
| GET | `/orgs/:orgId/invitations` | Yes | Yes | ADMIN+ | List org invitations |
| DELETE | `/orgs/:orgId/invitations/:id` | Yes | Yes | ADMIN+ | Cancel invitation |
| GET | `/invitations/mine` | Yes | Yes | — | List invitations for current vet |
| POST | `/invitations/:token/accept` | Yes | Yes | — | Accept invitation |
| POST | `/invitations/:token/decline` | Yes | Yes | — | Decline invitation |

#### Clients

| Method | Endpoint | Auth | Approval | Role | Delete Perm | Description |
|--------|----------|------|----------|------|-------------|-------------|
| POST | `/orgs/:orgId/clients` | Yes | Yes | MEMBER+ | — | Create client |
| GET | `/orgs/:orgId/clients` | Yes | Yes | MEMBER+ | — | List clients (paginated, searchable) |
| GET | `/orgs/:orgId/clients/:clientId` | Yes | Yes | MEMBER+ | — | Get client details |
| PATCH | `/orgs/:orgId/clients/:clientId` | Yes | Yes | MEMBER+ | — | Update client |
| PATCH | `/orgs/:orgId/clients/:clientId/deactivate` | Yes | Yes | ADMIN+ | — | Deactivate client |
| PATCH | `/orgs/:orgId/clients/:clientId/reactivate` | Yes | Yes | ADMIN+ | — | Reactivate client |
| DELETE | `/orgs/:orgId/clients/:clientId` | Yes | Yes | MEMBER+ | `canDeleteClients` | Soft-delete client (with reason) |
| POST | `/orgs/:orgId/clients/:clientId/restore` | Yes | Yes | ADMIN+ | — | Restore deleted client |

#### Animals

| Method | Endpoint | Auth | Approval | Role | Delete Perm | Description |
|--------|----------|------|----------|------|-------------|-------------|
| POST | `/orgs/:orgId/animals` | Yes | Yes | MEMBER+ | — | Register animal |
| GET | `/orgs/:orgId/animals` | Yes | Yes | MEMBER+ | — | List animals (paginated, searchable) |
| GET | `/orgs/:orgId/animals/:animalId` | Yes | Yes | MEMBER+ | — | Get animal details |
| PATCH | `/orgs/:orgId/animals/:animalId` | Yes | Yes | MEMBER+ | — | Update animal |
| PATCH | `/orgs/:orgId/animals/:animalId/deceased` | Yes | Yes | MEMBER+ | — | Mark animal as deceased |
| GET | `/orgs/:orgId/clients/:clientId/animals` | Yes | Yes | MEMBER+ | — | List animals for a client |
| DELETE | `/orgs/:orgId/animals/:animalId` | Yes | Yes | MEMBER+ | `canDeleteAnimals` | Soft-delete animal (with reason) |
| POST | `/orgs/:orgId/animals/:animalId/restore` | Yes | Yes | ADMIN+ | — | Restore deleted animal |

#### Treatment Records

| Method | Endpoint | Auth | Approval | Role | Delete Perm | Description |
|--------|----------|------|----------|------|-------------|-------------|
| POST | `/orgs/:orgId/treatments` | Yes | Yes | MEMBER+ | — | Create treatment record |
| GET | `/orgs/:orgId/treatments` | Yes | Yes | MEMBER+ | — | List treatments (latest versions) |
| GET | `/orgs/:orgId/treatments/:treatmentId` | Yes | Yes | MEMBER+ | — | Get treatment details |
| PUT | `/orgs/:orgId/treatments/:treatmentId` | Yes | Yes | MEMBER+ | — | Update (creates new version) |
| GET | `/orgs/:orgId/treatments/:treatmentId/history` | Yes | Yes | MEMBER+ | — | Get version history |
| GET | `/orgs/:orgId/animals/:animalId/treatments` | Yes | Yes | MEMBER+ | — | Treatments for an animal |
| DELETE | `/orgs/:orgId/treatments/:treatmentId` | Yes | Yes | MEMBER+ | `canDeleteTreatments` | Soft-delete treatment (with reason) |
| POST | `/orgs/:orgId/treatments/:treatmentId/restore` | Yes | Yes | ADMIN+ | — | Restore deleted treatment |

#### File Uploads

| Method | Endpoint | Auth | Approval | Description |
|--------|----------|------|----------|-------------|
| POST | `/uploads/profile-photo` | Yes | No | Upload vet profile photo |
| POST | `/orgs/:orgId/uploads/org-logo` | Yes | Yes | Upload organization logo |
| POST | `/orgs/:orgId/uploads/treatment-attachment` | Yes | Yes | Upload treatment attachment |

#### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | List notifications for current vet |
| PATCH | `/notifications/:id/read` | Yes | Mark notification as read |
| PATCH | `/notifications/read-all` | Yes | Mark all notifications as read |
| GET | `/notifications/unread-count` | Yes | Get unread notification count |

---

## 22. Row Level Security (RLS) Policies

### 22.1 Overview

Supabase RLS provides a **database-level security layer** that restricts row access based on the authenticated user. Even if the application layer has a bug, RLS prevents unauthorized data access.

### 22.2 Policy Definitions

#### `vets` Table

```sql
-- Vets can read their own record
CREATE POLICY "vets_select_own" ON vets
  FOR SELECT USING (auth_user_id = auth.uid());

-- Master admins can read all vets
CREATE POLICY "vets_select_admin" ON vets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vets WHERE auth_user_id = auth.uid() AND is_master_admin = true
    )
  );

-- Vets can update their own record
CREATE POLICY "vets_update_own" ON vets
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Master admins can update any vet (for approval/rejection/suspension)
CREATE POLICY "vets_update_admin" ON vets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM vets WHERE auth_user_id = auth.uid() AND is_master_admin = true
    )
  );
```

#### `organizations` Table

```sql
-- Members can read their organizations
CREATE POLICY "orgs_select_member" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN vets v ON v.id = om.vet_id
      WHERE om.organization_id = organizations.id
        AND v.auth_user_id = auth.uid()
        AND om.status = 'ACTIVE'
    )
  );

-- Approved vets can create organizations
CREATE POLICY "orgs_insert" ON organizations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM vets
      WHERE auth_user_id = auth.uid() AND status = 'APPROVED'
    )
  );
```

#### `clients` Table

```sql
-- Only members of the same org can access clients
CREATE POLICY "clients_org_member" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN vets v ON v.id = om.vet_id
      WHERE om.organization_id = clients.organization_id
        AND v.auth_user_id = auth.uid()
        AND om.status = 'ACTIVE'
    )
  );
```

#### `animals` Table

```sql
-- Only members of the same org can access animals
CREATE POLICY "animals_org_member" ON animals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN vets v ON v.id = om.vet_id
      WHERE om.organization_id = animals.organization_id
        AND v.auth_user_id = auth.uid()
        AND om.status = 'ACTIVE'
    )
  );
```

#### `treatment_records` Table

```sql
-- Only members of the same org can read treatment records
CREATE POLICY "treatments_select_org" ON treatment_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN vets v ON v.id = om.vet_id
      WHERE om.organization_id = treatment_records.organization_id
        AND v.auth_user_id = auth.uid()
        AND om.status = 'ACTIVE'
    )
  );

-- Members can create treatment records in their org
CREATE POLICY "treatments_insert_org" ON treatment_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN vets v ON v.id = om.vet_id
      WHERE om.organization_id = treatment_records.organization_id
        AND v.auth_user_id = auth.uid()
        AND om.status = 'ACTIVE'
    )
  );

-- Members with delete permission can soft-delete treatment records
-- (Application-level guard enforces canDeleteTreatments permission;
--  the actual operation is an UPDATE setting is_deleted = true,
--  not a physical DELETE, so no DELETE policy is needed)

-- Treatment records cannot be physically deleted (no DELETE policy)
-- Treatment records cannot be updated directly except for soft-delete fields
-- (only new versions created for clinical data changes)
```

#### `activity_logs` Table

```sql
-- Only OWNER or members with canViewActivityLog permission can read activity logs
CREATE POLICY "activity_logs_org_owner_or_granted" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_memberships om
      JOIN vets v ON v.id = om.vet_id
      WHERE om.organization_id = activity_logs.organization_id
        AND v.auth_user_id = auth.uid()
        AND om.status = 'ACTIVE'
        AND (
          om.role = 'OWNER'
          OR om.can_view_activity_log = true
        )
    )
  );

-- Activity logs are insert-only at application level
-- No update or delete policies (activity logs are immutable)
```

#### `audit_logs` Table

```sql
-- Audit logs are insert-only at application level
-- Only master admins and org admins can read audit logs
CREATE POLICY "audit_logs_admin_read" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vets
      WHERE auth_user_id = auth.uid() AND is_master_admin = true
    )
  );

-- No update or delete policies (audit logs are immutable)
```

---

## 23. Frontend Pages & UI Flow

### 23.1 Page Map

```
/                           → Landing/Home page (public)
/login                      → Login page (Google OAuth button)
/signup                     → Signup page (same as login)
/about                      → About page (public)
/privacy                    → Privacy policy (public)
/terms                      → Terms of service (public)

/auth/callback              → OAuth callback handler (no UI)

/onboarding/profile         → Vet profile form (multi-step)
/onboarding/pending         → "Application under review" waiting page

/account/rejected           → Rejection notice with reason
/account/suspended          → Suspension notice with reason

/dashboard                  → Main dashboard (org-scoped)
/dashboard/clients          → Client list
/dashboard/clients/new      → Create client form
/dashboard/clients/:id      → Client detail (with animals)
/dashboard/clients/:id/edit → Edit client form

/dashboard/animals          → Animal list
/dashboard/animals/new      → Register animal form
/dashboard/animals/:id      → Animal detail (with treatment history)
/dashboard/animals/:id/edit → Edit animal form

/dashboard/treatments       → Treatment records list
/dashboard/treatments/new   → Create treatment record form
/dashboard/treatments/:id   → Treatment detail (with version history)

/dashboard/activity         → Organization activity log (owner + granted admins only)

/dashboard/members          → Org member list (with permission badges)
/dashboard/members/:id/permissions → Manage member delete permissions (admin only)
/dashboard/invitations      → Invitation management

/dashboard/settings         → Organization settings (admin only)
/dashboard/profile          → Vet profile settings

/invitations/:token         → Invitation accept/decline page

/admin                      → Master Admin dashboard
/admin/vets                 → Vet management (queue, all vets)
/admin/vets/:id             → Vet detail (approve/reject/suspend)
/admin/stats                → Platform statistics
/admin/audit-logs           → Audit log viewer
```

### 23.2 Navigation Structure

**Top Navigation Bar:**
- Organization switcher (dropdown of user's orgs + "Create New" option)
- Notification bell (with unread count badge)
- User avatar + dropdown (Profile, Settings, Sign Out)

**Side Navigation (within dashboard):**
- Dashboard (overview/stats)
- Clients
- Animals
- Treatments
- Activity Log (owner only, or if granted `canViewActivityLog`)
- Members (admin only — owners can manage all permissions)
- Invitations (admin only)
- Settings (admin only)

### 23.3 Responsive Design

- **Desktop (1024px+):** Full side navigation + top bar.
- **Tablet (768px–1023px):** Collapsible side nav, full top bar.
- **Mobile (< 768px):** Bottom tab navigation for primary actions; hamburger menu for secondary.

### 23.4 UI Component Library

Using **shadcn/ui** components:
- `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`
- `Dialog`, `Sheet`, `Popover`, `Tooltip`
- `Table`, `DataTable` (with pagination, sorting, search)
- `Card`, `Badge`, `Avatar`
- `Form` (with React Hook Form integration)
- `Toast` (for success/error notifications)
- `Tabs`, `Accordion`
- `Skeleton` (loading states)
- `AlertDialog` (confirmation dialogs)
- `Command` (search/command palette)

### 23.5 Loading & Error States

Every page/component handles:
- **Loading:** Skeleton placeholders matching the content layout.
- **Empty:** Illustrated empty state with call-to-action (e.g., "No clients yet. Add your first client.").
- **Error:** Error message with retry button.
- **Unauthorized:** Redirect to appropriate page based on status.

---

## 24. Error Handling & Edge Cases

### 24.1 Error Code Reference

| Code | HTTP Status | Description |
|------|------------|-------------|
| `AUTH_TOKEN_MISSING` | 401 | No Authorization header provided |
| `AUTH_TOKEN_INVALID` | 401 | JWT signature invalid |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT has expired |
| `VET_NOT_FOUND` | 404 | No vet record for authenticated user |
| `VET_NOT_APPROVED` | 403 | Vet account pending approval |
| `VET_REJECTED` | 403 | Vet account was rejected |
| `VET_SUSPENDED` | 403 | Vet account is suspended |
| `VCN_DUPLICATE` | 409 | VCN number already registered |
| `PROFILE_ALREADY_SUBMITTED` | 409 | Profile already completed |
| `ORG_NOT_FOUND` | 404 | Organization does not exist |
| `ORG_NOT_MEMBER` | 403 | Vet is not a member of this organization |
| `INSUFFICIENT_ROLE` | 403 | Vet's role does not permit this action |
| `CLIENT_NOT_FOUND` | 404 | Client does not exist in this organization |
| `CLIENT_DUPLICATE` | 409 | Client with same details may already exist |
| `CLIENT_HAS_ACTIVE_ANIMALS` | 409 | Cannot delete client with active (non-deleted) animals |
| `ANIMAL_NOT_FOUND` | 404 | Animal does not exist in this organization |
| `MICROCHIP_DUPLICATE` | 409 | Microchip number already registered in org |
| `TREATMENT_NOT_FOUND` | 404 | Treatment record does not exist |
| `DELETE_PERMISSION_DENIED` | 403 | Vet does not have delete permission for this resource type |
| `DELETE_REASON_REQUIRED` | 400 | Deletion reason is required (min 10 characters) |
| `ALREADY_DELETED` | 409 | Record is already deleted |
| `NOT_DELETED` | 409 | Record is not deleted (cannot restore) |
| `PARENT_DELETED` | 409 | Cannot restore — parent record is deleted (restore parent first) |
| `INVITATION_NOT_FOUND` | 404 | Invitation does not exist |
| `INVITATION_EXPIRED` | 410 | Invitation has expired |
| `INVITATION_ALREADY_PROCESSED` | 409 | Invitation already accepted/declined |
| `INVITATION_EMAIL_MISMATCH` | 403 | Invitation is for a different email |
| `ALREADY_MEMBER` | 409 | Vet is already a member of this org |
| `INVITATION_ALREADY_PENDING` | 409 | Pending invitation already exists |
| `CANNOT_REMOVE_OWNER` | 403 | Organization owner cannot be removed |
| `OWNER_CANNOT_LEAVE` | 403 | Owner must transfer ownership before leaving |
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 24.2 Edge Case Handling

| Scenario | System Behavior |
|----------|----------------|
| Vet signs up with Google, closes browser before completing profile | On next login, vet is redirected to onboarding profile form |
| Vet submits duplicate VCN | `409` error; profile form shows "This VCN is already registered" |
| Master Admin approves vet who is already approved | Idempotent — no error, no status change |
| Vet tries to create org while pending approval | `403` — blocked by ApprovalGuard |
| Vet is suspended while actively using the platform | Next API request returns `403`; frontend detects and redirects to suspension page |
| Invitation sent to email not yet registered on platform | Invitation is created; vet can accept after registering and being approved |
| Invitation expires | Status auto-set to EXPIRED via a scheduled job or checked at acceptance time |
| Vet tries to accept invitation for different email | `403 "This invitation is for a different email"` |
| Two admins try to approve same vet simultaneously | Database-level optimistic locking — first one wins, second gets `409` |
| Treatment record references a client from different org | Foreign key + RLS blocks this; returns `404` |
| File upload exceeds size limit | `413 Payload Too Large` before processing |
| Concurrent profile edits | Last write wins; `updatedAt` field shows latest |
| Network timeout during treatment creation | Client retries; backend uses idempotency key to prevent duplicates |
| Google OAuth revokes access | Supabase refresh token fails; user must re-authenticate |
| Vet without delete permission tries to delete a client | `403 "You do not have permission to delete this resource"` |
| Vet deletes a client with 10 animals and 50 treatments | All animals and treatments are cascade soft-deleted; activity log records the cascade count |
| Admin restores a deleted animal whose parent client is deleted | `409 "Cannot restore — parent client is deleted. Restore the client first."` |
| Vet deletes a treatment that has 3 versions | All 3 versions are soft-deleted together as a chain |
| Two vets try to delete the same client simultaneously | First one succeeds, second gets `409 "Already deleted"` |
| Admin grants delete permission to a member, then revokes it | Member immediately loses delete ability on next request; previously deleted records stay deleted |
| Vet with delete permission is removed from org | All permissions are implicitly revoked (membership is no longer ACTIVE) |
| OWNER tries to modify their own permissions | `403 "Cannot modify owner permissions"` (OWNERs always have all permissions) |
| ADMIN tries to grant permissions to another member | `403 "Only organization owners can manage permissions"` |
| ADMIN with `canViewActivityLog: false` tries to access activity log | `403 "Only organization owner or members with explicit access can view activity log"` |
| OWNER grants `canViewActivityLog` to an ADMIN | ADMIN can now see full activity log; permission change is logged in activity log and audit log |

---

## 25. Audit Logging

### 25.1 What Gets Logged

**Every state-changing action** in the system creates an audit log entry:

| Action | Entity Type | Details Captured |
|--------|------------|------------------|
| `VET_CREATED` | VET | Email, auth user ID |
| `VET_PROFILE_SUBMITTED` | VET | All submitted fields |
| `VET_PROFILE_UPDATED` | VET | Changed fields (before/after) |
| `VET_APPROVED` | VET | Approving admin ID |
| `VET_REJECTED` | VET | Rejecting admin ID, reason |
| `VET_SUSPENDED` | VET | Suspending admin ID, reason |
| `VET_REACTIVATED` | VET | Reactivating admin ID |
| `VET_RESUBMITTED` | VET | Resubmission timestamp |
| `ORGANIZATION_CREATED` | ORGANIZATION | Org name, creator |
| `ORGANIZATION_UPDATED` | ORGANIZATION | Changed fields |
| `INVITATION_SENT` | INVITATION | Invited email, org, role |
| `INVITATION_ACCEPTED` | INVITATION | Accepting vet ID |
| `INVITATION_DECLINED` | INVITATION | Declining vet ID |
| `MEMBER_REMOVED` | MEMBERSHIP | Removed vet, removing admin |
| `MEMBER_LEFT` | MEMBERSHIP | Leaving vet ID |
| `MEMBER_ROLE_CHANGED` | MEMBERSHIP | Old role → new role |
| `MEMBER_PERMISSIONS_UPDATED` | MEMBERSHIP | Permission changes (before/after) |
| `CLIENT_CREATED` | CLIENT | Client name, org |
| `CLIENT_UPDATED` | CLIENT | Changed fields |
| `CLIENT_DEACTIVATED` | CLIENT | Reason |
| `CLIENT_REACTIVATED` | CLIENT | — |
| `CLIENT_DELETED` | CLIENT | Deleting vet, reason, cascade counts |
| `CLIENT_RESTORED` | CLIENT | Restoring admin |
| `ANIMAL_CREATED` | ANIMAL | Animal name, species, client |
| `ANIMAL_UPDATED` | ANIMAL | Changed fields |
| `ANIMAL_DECEASED` | ANIMAL | Date and cause of death |
| `ANIMAL_DELETED` | ANIMAL | Deleting vet, reason, cascade treatment count |
| `ANIMAL_RESTORED` | ANIMAL | Restoring admin |
| `TREATMENT_CREATED` | TREATMENT | Animal, diagnosis, vet |
| `TREATMENT_UPDATED` | TREATMENT | Version number, old/new record IDs |
| `TREATMENT_DELETED` | TREATMENT | Deleting vet, reason, version chain count |
| `TREATMENT_RESTORED` | TREATMENT | Restoring admin, version chain count |
| `LOGIN` | VET | IP address, user agent |
| `LOGOUT` | VET | — |

### 25.2 Audit Log Record Structure

```json
{
  "id": "uuid",
  "vetId": "uuid (acting user)",
  "action": "CLIENT_CREATED",
  "entityType": "CLIENT",
  "entityId": "uuid (created client)",
  "metadata": {
    "organizationId": "uuid",
    "clientName": "John Doe",
    "changedFields": null
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-02-08T12:00:00.000Z"
}
```

### 25.3 Audit Log Retention

- Audit logs are **never deleted**.
- They are stored in the same PostgreSQL database.
- For long-term cost optimization, logs older than 2 years can be archived to cold storage (future enhancement).

### 25.4 Audit Log Access

- **Master Admins** can view all audit logs via `/admin/audit-logs`.
- **Org Admins** can view audit logs scoped to their organization.
- **Regular members** cannot view audit logs directly (but their actions are logged).
- Audit logs support filtering by: action, entity type, vet, date range, organization.

---

## 26. Performance & Scalability

### 26.1 Performance Targets

| Metric | Target |
|--------|--------|
| API response time (p50) | < 100ms |
| API response time (p95) | < 500ms |
| API response time (p99) | < 1000ms |
| Page load time (FCP) | < 1.5s |
| Page load time (LCP) | < 2.5s |
| Database query time (p95) | < 50ms |
| Notification delivery | < 30s |
| System uptime | 99.9% |

### 26.2 Scalability Design

- **Horizontal scaling:** The NestJS backend is stateless — multiple instances can run behind a load balancer.
- **Database scaling:** Supabase Pro/Team plans support connection pooling (PgBouncer) and read replicas.
- **Organization isolation:** Data is naturally partitioned by organization, enabling future sharding strategies.
- **Pagination:** All list endpoints use cursor-based or offset pagination to avoid full table scans.
- **Caching:** Frequently accessed data (org details, membership lookups) can be cached in Redis (future enhancement).

### 26.3 Database Optimization

- All foreign key columns are indexed.
- Composite indexes on frequently queried combinations (e.g., `(organization_id, is_active)` on clients).
- `EXPLAIN ANALYZE` used during development to verify query plans.
- N+1 queries prevented by Prisma's `include` and `select` optimization.

### 26.4 Frontend Optimization

- **Code splitting:** Next.js automatic code splitting by route.
- **Image optimization:** Next.js `<Image>` component with Supabase Storage CDN.
- **Data fetching:** TanStack Query with stale-while-revalidate strategy.
- **Prefetching:** Links prefetched on hover for instant navigation.
- **Bundle size:** Monitored with `@next/bundle-analyzer`.

---

## 27. Testing Strategy

### 27.1 Testing Pyramid

```
         ┌────────────────┐
         │   E2E Tests     │  ← 10% (critical user flows)
         │   (Playwright)  │
         ├────────────────┤
         │  Integration    │  ← 30% (API endpoints, DB queries)
         │   Tests         │
         │  (Jest/Supertest)│
         ├────────────────┤
         │  Unit Tests     │  ← 60% (services, guards, utilities)
         │  (Jest)         │
         └────────────────┘
```

### 27.2 Unit Tests

**What to test:**
- All service methods (business logic)
- All guard logic (auth, approval, role, org scope)
- Validation DTOs (edge cases)
- Utility functions
- Notification templates

**Tools:** Jest, ts-jest
**Coverage target:** 80% minimum for services and guards

### 27.3 Integration Tests

**What to test:**
- Every API endpoint (happy path + error cases)
- Database queries (correct data retrieval, isolation)
- Auth flow (valid token, expired token, missing token)
- Role enforcement (correct permission checks)
- Organization isolation (cross-org access denied)

**Tools:** Jest, Supertest, Prisma (test database)
**Approach:** Each test suite seeds a test database, runs tests, and tears down.

### 27.4 End-to-End Tests

**What to test:**
- Complete signup → profile → approval → org creation → client → animal → treatment flow
- Admin approval/rejection workflow
- Invitation accept/decline flow
- Suspension and reactivation

**Tools:** Playwright
**Environment:** Staging environment with test Supabase project

### 27.5 Security Tests

- SQL injection attempts via API inputs
- JWT tampering (modified claims)
- Cross-org data access attempts
- Rate limiting verification
- RLS policy verification (direct database queries)

---

## 28. Deployment & Infrastructure

### 28.1 Environments

| Environment | Purpose | URL |
|------------|---------|-----|
| Development | Local development | localhost:3000 (frontend), localhost:3001 (backend) |
| Staging | Pre-production testing | staging.vetreg.com |
| Production | Live platform | vetreg.com |

### 28.2 Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...            # Direct connection (migrations)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...          # Server-side only, never exposed
SUPABASE_JWT_SECRET=...                # For JWT verification
FRONTEND_URL=https://vetreg.com        # CORS and redirects
RESEND_API_KEY=...                     # Email service
TWILIO_ACCOUNT_SID=...                # SMS service
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
SENTRY_DSN=...                         # Error monitoring
NODE_ENV=production
PORT=3001

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=https://api.vetreg.com/v1
NEXT_PUBLIC_SENTRY_DSN=...
```

### 28.3 CI/CD Pipeline

```
Push to main branch
  │
  ├─ 1. Lint (ESLint)
  ├─ 2. Type Check (tsc --noEmit)
  ├─ 3. Unit Tests (Jest)
  ├─ 4. Integration Tests (Jest + test DB)
  │
  ├─ All pass?
  │   ├── Yes → Deploy to Staging
  │   └── No → Fail, notify team
  │
  ├─ 5. Deploy to Staging
  │   ├── Run database migrations
  │   ├── Deploy backend (Railway/Render)
  │   └── Deploy frontend (Vercel)
  │
  ├─ 6. E2E Tests against Staging (Playwright)
  │
  ├─ All pass?
  │   ├── Yes → Manual approval for Production
  │   └── No → Fail, notify team
  │
  └─ 7. Deploy to Production (manual trigger)
      ├── Run database migrations
      ├── Deploy backend
      └── Deploy frontend
```

### 28.4 Database Migrations

- Managed by **Prisma Migrate**.
- Migrations are version-controlled in `prisma/migrations/`.
- Migrations run automatically during deployment (before app starts).
- Rollback strategy: Create a new migration to reverse changes (Prisma does not support down migrations natively).

### 28.5 Monitoring & Alerting

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking, performance monitoring |
| Supabase Dashboard | Database metrics, auth events, storage usage |
| Vercel Analytics | Frontend performance, Web Vitals |
| Railway/Render Metrics | Backend CPU, memory, request count |
| UptimeRobot / BetterUptime | Uptime monitoring with SMS/email alerts |

**Alert Thresholds:**
- Error rate > 1% of requests → Slack alert
- API p95 latency > 1000ms → Slack alert
- Database connection pool > 80% → Slack alert
- Disk usage > 80% → Email alert
- System downtime → SMS + Slack alert

---

## 29. Compliance & Data Privacy

### 29.1 Data Classification

| Classification | Examples | Handling |
|---------------|----------|---------|
| **Public** | Org name, vet's professional title | Can be displayed without restriction |
| **Internal** | Client names, animal records | Org-scoped access only |
| **Confidential** | VCN numbers, phone numbers, medical records | Encrypted at rest, org-scoped, audit-logged |
| **Restricted** | Supabase service keys, JWT secrets | Environment variables only, never logged |

### 29.2 Data Retention

| Data Type | Retention Period | Justification |
|-----------|-----------------|---------------|
| Vet profiles | Indefinite | Required for platform integrity |
| Treatment records | Indefinite (immutable) | Medical record compliance |
| Audit logs | Indefinite (archival after 2 years) | Compliance and accountability |
| Notifications | 1 year | Operational reference |
| Expired invitations | 90 days | Cleanup |
| Session tokens | Until expiry or sign-out | Security |

### 29.3 Data Deletion Policy

- **Vet requests account deletion:**
  - Personal data is anonymized (name, phone, email replaced with "[DELETED]").
  - VCN number is removed.
  - Auth user is deleted from Supabase.
  - Organization memberships are set to `LEFT`.
  - Treatment records are preserved with vet reference anonymized.
  - Audit logs are preserved with vet reference anonymized.
  - This is a **soft deletion** that preserves data integrity.

### 29.4 NDPR Compliance (Nigeria Data Protection Regulation)

- Consent obtained during signup (Google OAuth consent + platform terms acceptance).
- Users can request a copy of their data (data export endpoint — V2).
- Users can request deletion (anonymization as described above).
- Data processing purpose clearly stated in privacy policy.
- Data breach notification procedures documented.

---

## 30. Future Roadmap

### 30.1 Version 1.5 (3 months after V1)

- [ ] In-app real-time notifications (Supabase Realtime)
- [ ] Advanced search with filters (date range, species, diagnosis)
- [ ] Dashboard analytics (charts, trends)
- [ ] Bulk client/animal import (CSV upload)
- [ ] Profile photo cropping/editing
- [ ] Dark mode support

### 30.2 Version 2.0 (6 months after V1)

- [ ] Client (pet owner) self-service portal
- [ ] Appointment scheduling
- [ ] Prescription management
- [ ] Invoice generation and payment tracking
- [ ] Organization ownership transfer
- [ ] Data export (CSV, PDF reports)
- [ ] Multi-language support

### 30.3 Version 3.0 (12 months after V1)

- [ ] Mobile native apps (iOS + Android via React Native)
- [ ] Telemedicine/video consultation
- [ ] Lab system integration (external APIs)
- [ ] Inventory management
- [ ] Advanced reporting and business intelligence
- [ ] API for third-party integrations
- [ ] Multi-country support (beyond Nigeria)

---

## 31. Glossary

| Term | Definition |
|------|-----------|
| **Vet** | A veterinary professional who registers on the platform |
| **VCN** | Veterinary Council of Nigeria — the regulatory body that issues practice licenses |
| **VCN Number** | The unique license number issued to a vet by the VCN |
| **Organization** | A veterinary clinic, hospital, or practice group created on the platform |
| **Client** | A pet owner or animal custodian registered within an organization |
| **Animal** | A pet or animal registered under a client |
| **Treatment Record** | A versioned medical record documenting a vet's treatment of an animal |
| **Master Admin** | A platform-level administrator who approves/rejects/suspends vets |
| **Org Admin** | An organization-level administrator who manages members and settings |
| **RLS** | Row Level Security — Supabase/PostgreSQL feature for database-level access control |
| **JWT** | JSON Web Token — the authentication token used for API requests |
| **Guard** | A NestJS interceptor that checks authorization before a request reaches the controller |
| **DeletePermissionGuard** | A parameterized NestJS guard that checks whether a vet has been granted a specific delete permission on their org membership |
| **DTO** | Data Transfer Object — a class that defines the shape and validation rules for request/response data |
| **Soft Delete** | Marking a record as deleted (isDeleted=true) without physically removing it from the database |
| **Idempotent** | An operation that produces the same result regardless of how many times it's executed |
| **Activity Log** | A per-organization chronological feed of all actions performed by members, visible only to the OWNER (or members explicitly granted canViewActivityLog permission) |
| **Audit Log** | A platform-wide compliance log of all system actions, visible to Master Admins and Org Admins |
| **Delete Permission** | A granular, per-member boolean flag that must be explicitly granted before a member can soft-delete clients, animals, or treatments |
| **Multi-tenant** | An architecture where a single system serves multiple isolated organizations |
| **PKCE** | Proof Key for Code Exchange — a security extension to the OAuth 2.0 authorization code flow |
| **Cascade Soft Delete** | When a parent record is soft-deleted, all child records are automatically soft-deleted too (e.g., deleting a client cascades to its animals and their treatments) |

---

## Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Technical Lead | | | |
| Backend Lead | | | |
| Frontend Lead | | | |
| Security Reviewer | | | |

---

*End of PRD — Version 1.1.0*
