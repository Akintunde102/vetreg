# Frontend Tasks — Veterinary Registration & Practice Management Platform

**Technology Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query, @supabase/ssr
**Total Tasks:** ~80

Legend: `[ ]` = To do | `[x]` = Done | Priority: `P0` = Must have | `P1` = Should have | `P2` = Nice to have

---

## Epic 1: Frontend Project Setup

- [ ] **1.1** Initialize Next.js 14+ frontend project (App Router) with TypeScript `P0`
- [ ] **1.2** Set up Tailwind CSS + shadcn/ui component library `P0`
- [ ] **1.3** Configure ESLint + Prettier for frontend `P0`
- [ ] **1.4** Set up environment variable management (.env.local, .env.example template) `P0`
- [ ] **1.5** Install and configure React Hook Form + Zod for form validation `P0`
- [ ] **1.6** Install and configure TanStack Query for server state management `P0`
- [ ] **1.7** Set up Supabase Auth client with @supabase/ssr `P0`
- [ ] **1.8** Set up Sentry for frontend error tracking `P1`
- [ ] **1.9** Set up Vercel hosting for staging environment `P1`
- [ ] **1.10** Configure bundle analyzer (@next/bundle-analyzer) for monitoring `P2`

---

## Epic 2: Core Layout & Auth Components

- [ ] **2.1** Create base layout with responsive container, navigation structure `P0`
- [ ] **2.2** Create `AuthProvider` context for managing auth state (session, user, loading) `P0`
- [ ] **2.3** Create `ProtectedRoute` wrapper component (redirects unauthenticated users to /login with redirect param) `P0`
- [ ] **2.4** Create organization switcher component (dropdown in top navbar) `P0`
- [ ] **2.5** Create user avatar dropdown component (Profile, Settings, Sign Out) `P0`
- [ ] **2.6** Create side navigation component for dashboard with conditional menu items based on role/permissions `P0`
- [ ] **2.7** Create responsive navigation (desktop sidebar, tablet collapsible, mobile bottom tabs) `P1`
- [ ] **2.8** Create toast notification system using shadcn/ui Toast `P0`
- [ ] **2.9** Create loading skeleton components for all major page types `P1`
- [ ] **2.10** Create empty state component with illustrations and CTAs `P1`

---

## Epic 3: Public Pages & Authentication Flow

- [ ] **3.1** Build Landing/Home page (`/`) with hero section, features overview, CTA buttons `P0`
- [ ] **3.2** Build Login page (`/login`) with "Sign in with Google" button using @supabase/ssr `P0`
- [ ] **3.3** Build Signup page (`/signup`) — same as login (Google OAuth is the only method) `P0`
- [ ] **3.4** Build OAuth callback handler (`/auth/callback`) — exchange code for session, call GET /auth/me, route based on vet status `P0`
- [ ] **3.5** Implement session management (auto-refresh, sync across tabs, redirect on expiry) `P0`
- [ ] **3.6** Build About page (`/about`) `P2`
- [ ] **3.7** Build Privacy Policy page (`/privacy`) `P1`
- [ ] **3.8** Build Terms of Service page (`/terms`) `P1`

---

## Epic 4: Vet Onboarding & Profile

- [ ] **4.1** Build multi-step onboarding profile form (`/onboarding/profile`) `P0`
  - [ ] **4.1a** Step 1: Personal Information (fullName, phone, DOB, gender, photo upload)
  - [ ] **4.1b** Step 2: Professional Information (VCN, specialization, experience, qualifications)
  - [ ] **4.1c** Step 3: Practice Information (address, city, state, practice type)
  - [ ] **4.1d** Progress indicator, validation per step, back/next navigation
- [ ] **4.2** Build "Application under review" waiting page (`/onboarding/pending`) `P0`
- [ ] **4.3** Build rejection notice page (`/account/rejected`) showing rejection reason `P0`
- [ ] **4.4** Build suspension notice page (`/account/suspended`) showing suspension reason `P0`
- [ ] **4.5** Build vet profile settings page (`/dashboard/profile`) for editing profile after approval `P0`

---

## Epic 5: Master Admin Dashboard (Frontend)

- [ ] **5.1** Build Master Admin layout with admin-specific navigation `P0`
- [ ] **5.2** Build vet review queue page (`/admin/vets`) with tabs: Pending, Approved, Rejected, Suspended, All `P0`
- [ ] **5.3** Build vet detail page (`/admin/vets/:id`) with all profile details and action buttons `P0`
- [ ] **5.4** Build Approve button with confirmation dialog `P0`
- [ ] **5.5** Build Reject button with modal (required reason field, min 10 chars) `P0`
- [ ] **5.6** Build Suspend button with modal (required reason field) `P0`
- [ ] **5.7** Build Reactivate button with confirmation dialog `P0`
- [ ] **5.8** Build platform statistics dashboard (`/admin/stats`) with charts (vet counts, org counts) `P2`
- [ ] **5.9** Build admin audit log viewer (`/admin/audit-logs`) with filtering `P1`

---

## Epic 6: Organization Management (Frontend)

- [ ] **6.1** Build organization creation form (modal or page) with logo upload `P0`
- [ ] **6.2** Build main dashboard page (`/dashboard`) with org-scoped stats overview (client count, animal count, treatment count, recent activity preview) `P0`
- [ ] **6.3** Build organization settings page (`/dashboard/settings`) — edit name, address, contact info, logo (ADMIN+ only) `P0`
- [ ] **6.4** Implement organization context provider to track currently selected org `P0`
- [ ] **6.5** Build organization list/switcher UI in top navbar `P0`

---

## Epic 7: Organization Membership & Invitations (Frontend)

- [ ] **7.1** Build members list page (`/dashboard/members`) with role badges and permission indicators `P0`
- [ ] **7.2** Build invite member modal (email input + role selection dropdown) `P0`
- [ ] **7.3** Build invitation management page (`/dashboard/invitations`) with tabs: Pending, Accepted, Declined `P0`
- [ ] **7.4** Build invitation accept/decline page (`/invitations/:token`) — public page showing org details and accept/decline buttons `P0`
- [ ] **7.5** Build member role change UI (inline dropdown on member row, ADMIN+ only) `P0`
- [ ] **7.6** Build member permissions management page (`/dashboard/members/:id/permissions`) — toggle switches for canDeleteClients, canDeleteAnimals, canDeleteTreatments, canViewActivityLog (OWNER only) `P0`
- [ ] **7.7** Build remove member confirmation dialog `P0`
- [ ] **7.8** Build leave organization confirmation dialog `P0`
- [ ] **7.9** Conditionally show/hide admin-only menu items (Members, Invitations, Settings) based on user role `P0`

---

## Epic 8: Client Management (Frontend)

- [ ] **8.1** Build client list page (`/dashboard/clients`) with search bar, filters (isActive), pagination, sort options `P0`
- [ ] **8.2** Build create client form (`/dashboard/clients/new`) `P0`
- [ ] **8.3** Build client detail page (`/dashboard/clients/:id`) showing client info + list of animals `P0`
- [ ] **8.4** Build edit client form (`/dashboard/clients/:id/edit`) `P0`
- [ ] **8.5** Build deactivate client button with confirmation dialog (ADMIN+ only) `P0`
- [ ] **8.6** Build reactivate client button (ADMIN+ only) `P0`
- [ ] **8.7** Build delete client confirmation dialog with required reason field (textarea, min 10 chars) `P0`
- [ ] **8.8** Build restore client button (ADMIN+ only, shows for soft-deleted clients) `P0`
- [ ] **8.9** Conditionally show/hide delete button based on user's canDeleteClients permission `P0`
- [ ] **8.10** Show "deleted" badge and grayed-out styling for deleted clients (when ?includeDeleted=true) `P0`

---

## Epic 9: Animal Management (Frontend)

- [ ] **9.1** Build animal list page (`/dashboard/animals`) with search, filters (species, isAlive, isActive), pagination, sort `P0`
- [ ] **9.2** Build register animal form (`/dashboard/animals/new`) with client selector dropdown, species, breed, photo upload `P0`
- [ ] **9.3** Build animal detail page (`/dashboard/animals/:id`) showing animal info, owner (client) details, treatment history timeline `P0`
- [ ] **9.4** Build edit animal form (`/dashboard/animals/:id/edit`) allowing client transfer within org `P0`
- [ ] **9.5** Build mark deceased modal with dateOfDeath and causeOfDeath fields `P0`
- [ ] **9.6** Build delete animal confirmation dialog with required reason field `P0`
- [ ] **9.7** Build restore animal button (ADMIN+ only) `P0`
- [ ] **9.8** Conditionally show/hide delete button based on user's canDeleteAnimals permission `P0`
- [ ] **9.9** Show "deleted" badge and grayed-out styling for deleted animals `P0`
- [ ] **9.10** Show "deceased" badge for animals with isAlive=false `P0`

---

## Epic 10: Medical Treatment Records (Frontend)

- [ ] **10.1** Build treatment records list page (`/dashboard/treatments`) with search (by diagnosis, complaint), filters (status, date range, vet), pagination, sort `P0`
- [ ] **10.2** Build create treatment form (`/dashboard/treatments/new`) `P0`
  - [ ] **10.2a** Animal selector dropdown
  - [ ] **10.2b** Visit date picker, chief complaint textarea
  - [ ] **10.2c** Clinical findings, diagnosis, differential diagnosis fields
  - [ ] **10.2d** Treatment given textarea, prescription builder (add multiple drugs with dosage/frequency/duration)
  - [ ] **10.2e** Vitals fields: weight, temperature, heart rate, respiratory rate, body condition score
  - [ ] **10.2f** File attachment uploader (multi-file, max 50MB total)
  - [ ] **10.2g** Follow-up date and notes
- [ ] **10.3** Build treatment detail page (`/dashboard/treatments/:id`) with full treatment data + version history panel `P0`
- [ ] **10.4** Build treatment edit form (creates new version) — reuse create form structure `P0`
- [ ] **10.5** Build version history panel showing all versions with timestamps, version numbers, vet who made each version `P0`
- [ ] **10.6** Build treatment version diff view (compare two versions side-by-side) `P1`
- [ ] **10.7** Build delete treatment confirmation dialog with required reason field `P0`
- [ ] **10.8** Build restore treatment button (ADMIN+ only) `P0`
- [ ] **10.9** Conditionally show/hide delete button based on user's canDeleteTreatments permission `P0`
- [ ] **10.10** Show "deleted" badge for deleted treatments `P0`

---

## Epic 11: File Uploads (Frontend)

- [ ] **11.1** Build reusable image upload component with preview, drag-and-drop, file validation `P1`
- [ ] **11.2** Build image crop component for profile photos and org logos `P1`
- [ ] **11.3** Integrate photo upload into vet profile form `P0`
- [ ] **11.4** Integrate logo upload into org settings `P0`
- [ ] **11.5** Build multi-file attachment uploader for treatment records with progress bars `P0`
- [ ] **11.6** Display attached files with thumbnails (images) or file icons (PDFs) `P0`

---

## Epic 12: Notifications (Frontend)

- [ ] **12.1** Build notification bell icon in top navbar with unread count badge `P1`
- [ ] **12.2** Build notification dropdown/panel listing recent notifications (most recent 10) `P1`
- [ ] **12.3** Implement mark-as-read on notification click `P1`
- [ ] **12.4** Build "View All Notifications" link to full notification page `P1`
- [ ] **12.5** Build full notifications page (`/dashboard/notifications`) with pagination `P2`
- [ ] **12.6** Implement mark-all-as-read button `P1`

---

## Epic 13: Organization Activity Log (Frontend)

- [ ] **13.1** Build activity log page (`/dashboard/activity`) with chronological feed (newest first) `P0`
- [ ] **13.2** Build activity log entry component: vet avatar, vet name, action description, relative timestamp, entity link, color-coded action badge `P0`
- [ ] **13.3** Build filter bar: action type dropdown, entity type dropdown, member dropdown, date range picker, search field `P0`
- [ ] **13.4** Implement infinite scroll or pagination for activity feed `P0`
- [ ] **13.5** Build empty state: "No activity yet. Actions performed within this organization will appear here." `P0`
- [ ] **13.6** Conditionally show/hide Activity Log menu item based on OWNER role or canViewActivityLog permission `P0`

---

## Epic 14: UI Polish & Accessibility

- [ ] **14.1** Implement consistent skeleton loading states for all list pages `P1`
- [ ] **14.2** Implement empty states with illustrations and CTAs for all list pages (clients, animals, treatments, members, invitations) `P1`
- [ ] **14.3** Implement toast notifications (success/error) for all CRUD actions `P0`
- [ ] **14.4** Ensure responsive design works correctly on desktop (1024px+), tablet (768-1023px), mobile (<768px) `P1`
- [ ] **14.5** Test keyboard navigation on all forms and interactive elements `P2`
- [ ] **14.6** Add ARIA labels to all interactive elements for screen reader accessibility `P2`
- [ ] **14.7** Test color contrast ratios for WCAG AA compliance `P2`
- [ ] **14.8** Add loading spinners to all async buttons (prevent double-submit) `P0`
- [ ] **14.9** Implement error boundaries to gracefully handle component crashes `P1`
- [ ] **14.10** Implement form auto-save or unsaved changes warning for long forms `P2`

---

## Epic 15: Deployment & Testing (Frontend)

- [ ] **15.1** Set up Vercel production environment with custom domain `P0`
- [ ] **15.2** Configure production environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SENTRY_DSN) `P0`
- [ ] **15.3** Set up Playwright for E2E testing `P1`
- [ ] **15.4** Write E2E test: complete signup → profile → org creation flow `P1`
- [ ] **15.5** Write E2E test: invite member → accept invitation flow `P1`
- [ ] **15.6** Write E2E test: create client → create animal → create treatment flow `P1`
- [ ] **15.7** Write E2E test: soft-delete client with cascade → restore client `P1`
- [ ] **15.8** Set up GitHub Actions CD pipeline: auto-deploy to Vercel preview on PR; auto-deploy to staging on merge to develop `P0`
- [ ] **15.9** Run Lighthouse audit on all major pages (target: Performance 90+, Accessibility 90+, Best Practices 90+) `P1`
- [ ] **15.10** Verify all production links, images, and external services are working `P0`
- [ ] **15.11** Smoke test all critical user flows on production `P0`

---

## Frontend Task Summary

| Epic | Tasks | P0 | P1 | P2 |
|------|-------|----|----|-----|
| 1. Setup | 10 | 7 | 2 | 1 |
| 2. Core Layout | 10 | 7 | 3 | 0 |
| 3. Public Pages & Auth | 8 | 6 | 1 | 1 |
| 4. Onboarding & Profile | 5 | 5 | 0 | 0 |
| 5. Master Admin | 9 | 7 | 1 | 1 |
| 6. Organizations | 5 | 5 | 0 | 0 |
| 7. Memberships | 9 | 9 | 0 | 0 |
| 8. Clients | 10 | 10 | 0 | 0 |
| 9. Animals | 10 | 10 | 0 | 0 |
| 10. Treatments | 10 | 9 | 1 | 0 |
| 11. File Uploads | 6 | 4 | 2 | 0 |
| 12. Notifications | 6 | 0 | 5 | 1 |
| 13. Activity Log | 6 | 6 | 0 | 0 |
| 14. UI Polish | 10 | 3 | 4 | 3 |
| 15. Deploy & Testing | 11 | 5 | 6 | 0 |
| **Total** | **125** | **93** | **25** | **7** |

---

## Suggested Build Order (Frontend)

```
Week 1: Epics 1-3  (Setup, Layout, Public Pages, Auth)
Week 2: Epics 4-5  (Onboarding, Admin Dashboard)
Week 3: Epics 6-7  (Organizations, Memberships)
Week 4: Epics 8-10 (Clients, Animals, Treatments)
Week 5: Epics 11-13 (Uploads, Notifications, Activity Log)
Week 6: Epics 14-15 (Polish, Testing, Deployment)
```

**Estimated:** 6 weeks for 1 frontend developer working full-time

---

## Component Library Checklist (shadcn/ui)

Install these shadcn/ui components as needed:

- [ ] Button, Input, Textarea, Label
- [ ] Select, Checkbox, RadioGroup, Switch
- [ ] Dialog, AlertDialog, Sheet
- [ ] Dropdown Menu, Popover, Tooltip
- [ ] Table, DataTable (with sorting, pagination)
- [ ] Card, Badge, Avatar, Separator
- [ ] Form (React Hook Form integration)
- [ ] Toast, Alert
- [ ] Tabs, Accordion
- [ ] Skeleton (loading states)
- [ ] Command (command palette/search)
- [ ] Calendar, Date Picker
- [ ] Progress bar
