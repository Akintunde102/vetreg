# Documentation — Veterinary Registration & Practice Management Platform

This folder contains all project documentation, specifications, and task lists.

**Current Backend Version:** 1.1.0 (February 9, 2026)

---

## 🆕 Version 1.1.0 — Backend Implementation Complete

The backend has been enhanced with the following features. See **[backend/docs](./../backend/docs/)** for full API and migration details.

| Feature | Status | Documentation |
|--------|--------|----------------|
| Patient types (Single Pet, Single Livestock, Batch Livestock) | ✅ Done | [NEW_FEATURES.md](../backend/docs/NEW_FEATURES.md) |
| Organization approval by Master Admin | ✅ Done | [NEW_FEATURES.md](../backend/docs/NEW_FEATURES.md) |
| Treatment payment tracking (paid/owed) | ✅ Done | [NEW_FEATURES.md](../backend/docs/NEW_FEATURES.md) |
| Scheduled treatments | ✅ Done | [NEW_FEATURES.md](../backend/docs/NEW_FEATURES.md) |
| Treatment history import for livestock | ✅ Done | [NEW_FEATURES.md](../backend/docs/NEW_FEATURES.md) |
| Organization revenue tracking | ✅ Done | [NEW_FEATURES.md](../backend/docs/NEW_FEATURES.md) |

**Quick links:**
- [Backend API reference (v1.1)](../backend/docs/API_ENDPOINTS_V1.1.md)
- [Migration guide (v1.0 → v1.1)](../backend/docs/MIGRATION_GUIDE.md)
- [Deployment & testing](./DEPLOYMENT_AND_TESTING.md)
- [Test results summary](./TEST_RESULTS.md)

---

## 📄 Documents

### [PRD.md](./PRD.md)
**Product Requirements Document (v1.1.0)** — The complete specification for the platform.

**Sections:**
- Executive summary, goals, problem statement
- User personas & product scope
- Complete technology stack (NestJS, Next.js, Supabase, Prisma)
- System architecture & request lifecycle
- Authentication & authorization (5-layer guard chain)
- All features: vet registration, admin approval, organizations, memberships, clients, animals, treatments
- **Granular delete permissions** (canDeleteClients, canDeleteAnimals, canDeleteTreatments, canViewActivityLog)
- **Organization Activity Log** (OWNER-only by default, explicit grant for ADMINs)
- Database schema (Prisma models, indexes, RLS policies)
- Complete API endpoint reference (40+ endpoints)
- Frontend pages & UI flow
- Error codes, edge cases, audit logging
- Security, performance, testing, deployment
- Compliance & data privacy (NDPR)

**Pages:** 3,429 lines | **Date:** February 8, 2026

---

### [BACKEND_TASKS.md](./BACKEND_TASKS.md)
**Backend Task List** — All backend development tasks organized by epic.

**Technology:** NestJS, TypeScript, Prisma, PostgreSQL (Supabase), Resend/SendGrid, Twilio

**Epics:**
1. Infrastructure Setup (8 tasks)
2. Database Schema & Migrations (9 tasks)
3. Core Guards & Middleware (15 tasks)
4. Authentication & Vet Registration (10 tasks)
5. Master Admin Dashboard (10 tasks)
6. Organization Management (8 tasks)
7. Membership & Invitations (17 tasks)
8. Client Management (13 tasks)
9. Animal Management (12 tasks)
10. Medical Treatment Records (12 tasks)
11. File Uploads (6 tasks)
12. Notifications System (13 tasks)
13. Organization Activity Log (7 tasks)
14. Audit Logging (6 tasks)
15. Testing & Deployment (15 tasks)

**Total:** 161 tasks | **P0:** 132 | **P1:** 25 | **P2:** 4
**Estimated:** 6 weeks (1 full-time backend developer)

---

### [FRONTEND_TASKS.md](./FRONTEND_TASKS.md)
**Frontend Task List** — All frontend development tasks organized by epic.

**Technology:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query

**Epics:**
1. Project Setup (10 tasks)
2. Core Layout & Auth Components (10 tasks)
3. Public Pages & Auth Flow (8 tasks)
4. Vet Onboarding & Profile (5 tasks)
5. Master Admin Dashboard (9 tasks)
6. Organization Management (5 tasks)
7. Membership & Invitations (9 tasks)
8. Client Management (10 tasks)
9. Animal Management (10 tasks)
10. Medical Treatment Records (10 tasks)
11. File Uploads (6 tasks)
12. Notifications (6 tasks)
13. Organization Activity Log (6 tasks)
14. UI Polish & Accessibility (10 tasks)
15. Deployment & Testing (11 tasks)

**Total:** 125 tasks | **P0:** 93 | **P1:** 25 | **P2:** 7
**Estimated:** 6 weeks (1 full-time frontend developer)

---

### [TASKS_MASTER.md](./TASKS_MASTER.md)
**Master Task List** — Combined backend + frontend tasks with detailed descriptions.

All 15 epics with 243 total tasks, organized in suggested build order with duration estimates.

---

## 🏗️ Build Order

The project is designed to be built in 6 phases over ~8 weeks (1 full-stack developer) or ~4-5 weeks (2 developers working in parallel):

```
Phase 1 — Foundation (Epics 1-3)
  │  Backend: Infrastructure, DB schema, guards, middleware
  │  Frontend: Setup, core layout, auth pages
  │  Duration: ~1 week
  │
Phase 2 — Auth & Admin (Epics 4-5)
  │  Backend: Google OAuth, vet registration, admin approval endpoints
  │  Frontend: Onboarding forms, admin dashboard
  │  Duration: ~1.5 weeks
  │
Phase 3 — Organizations (Epics 6-7)
  │  Backend: Org CRUD, memberships, invitations, permissions
  │  Frontend: Org creation, member management, invitation flows
  │  Duration: ~1.5 weeks
  │
Phase 4 — Core Data (Epics 8-10, 11)
  │  Backend: Clients, animals, treatments endpoints + file uploads
  │  Frontend: CRUD pages for all entities
  │  Duration: ~2 weeks
  │
Phase 5 — Logging & Notifications (Epics 12-14)
  │  Backend: Notifications, activity log, audit log
  │  Frontend: Notification UI, activity log page
  │  Duration: ~1 week
  │
Phase 6 — Polish & Ship (Epic 15)
  │  Backend: E2E tests, security tests, deployment
  │  Frontend: UI polish, E2E tests, deployment
  │  Duration: ~1 week
```

---

## 🎯 Priority Guide

- **P0 (Must Have):** Core features required for V1 launch. ~192 tasks total.
- **P1 (Should Have):** Important features that enhance the product. ~40 tasks total.
- **P2 (Nice to Have):** Polish features that can be deferred to V1.1. ~11 tasks total.

---

## 🔑 Key Features

### Authentication & Verification
- Google OAuth (exclusive authentication method)
- Master Admin approval workflow for all vets
- Multi-factor status system (PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED)

### Multi-Tenant Architecture
- Complete data isolation between organizations
- Row Level Security (RLS) policies at database level
- Organization-scoped API endpoints with OrgScopeGuard

### Granular Permissions
- **Delete permissions** (canDeleteClients, canDeleteAnimals, canDeleteTreatments) — must be explicitly granted by OWNER
- **Activity Log access** (canViewActivityLog) — OWNER-only by default, explicit grant for ADMINs
- OWNER has all permissions implicitly (cannot be revoked)
- Only OWNER can grant/revoke permissions

### Soft Delete & Restore
- All deletions are soft deletes (isDeleted flag + metadata)
- Cascade soft-delete (client → animals → treatments)
- ADMIN+ can restore with parent-child integrity checks
- All deletions require a mandatory reason (min 10 characters)

### Versioned Medical Records
- Treatment records are versioned (not immutable)
- Updates create new versions; previous versions preserved
- Full version history with who/when for each edit
- Soft-delete deletes entire version chain

### Activity Log
- Org-scoped chronological feed of all actions
- Human-readable descriptions with rich metadata
- OWNER-only by default (ADMINs need explicit canViewActivityLog grant)
- Separate from platform-wide Audit Log

### Audit Log
- Platform-wide compliance logging
- All state-changing actions logged with vetId, action, entityType, entityId, IP, user-agent
- Master Admins + Org Admins can view

---

## 📊 Task Count Summary

| Category | Backend | Frontend | Total |
|----------|---------|----------|-------|
| **P0** | 132 | 93 | **225** |
| **P1** | 25 | 25 | **50** |
| **P2** | 4 | 7 | **11** |
| **Total** | **161** | **125** | **286** |

---

## 🚀 Next Steps

1. **For Backend Developers:** Start with [BACKEND_TASKS.md](./BACKEND_TASKS.md) Epic 1-3; then see [backend/docs](../backend/docs/) for v1.1 API and migration.
2. **For Frontend Developers:** Start with [FRONTEND_TASKS.md](./FRONTEND_TASKS.md) Epic 1-3
3. **For Full-Stack Developers:** Follow the build order in [TASKS_MASTER.md](./TASKS_MASTER.md)
4. **For Product/Design:** Review [PRD.md](./PRD.md) for complete feature specifications
5. **For Deployment & Testing:** See [DEPLOYMENT_AND_TESTING.md](./DEPLOYMENT_AND_TESTING.md)

---

## 📞 Support

For questions about the PRD or tasks, refer to:
- PRD Section 31: Glossary (definitions of all key terms)
- PRD Section 24: Error Handling & Edge Cases (comprehensive scenario matrix)
- PRD Section 21: API Design (complete endpoint reference with guards, roles, permissions)
- Backend v1.1: [backend/docs/README.md](../backend/docs/README.md) and [API_ENDPOINTS_V1.1.md](../backend/docs/API_ENDPOINTS_V1.1.md)

---

*Last Updated: February 9, 2026*
