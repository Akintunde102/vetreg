# Deployment & Testing Guide

**Last Updated:** February 9, 2026  
**Backend Version:** 1.1.0

This document describes how to run tests, verify the build, and deploy the Veterinary Registration & Practice Management Platform backend.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 9+
- **PostgreSQL** (or Supabase project for `DATABASE_URL`)
- **Environment:** Copy `backend/.env.example` to `backend/.env` and set variables

---

## Quick Commands

```bash
# From project root
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build (production bundle)
npm run build

# Unit tests
npm run test

# E2E tests (requires DATABASE_URL)
npm run test:e2e

# Lint
npm run lint

# Start development server
npm run start:dev

# Start production server (after build)
npm run start:prod
```

---

## 1. Build Verification

Verify the project compiles and builds successfully:

```bash
cd backend
npm run build
```

**Expected:** Build completes with no errors. Output is in `backend/dist/`.

**If it fails:**
- Run `npx prisma generate`
- Check for TypeScript errors: `npx tsc --noEmit`
- Ensure all dependencies are installed: `npm ci`

---

## 2. Unit Tests

Unit tests run with Jest and do **not** require a database.

```bash
cd backend
npm run test
```

**Options:**
- `npm run test:watch` — watch mode
- `npm run test:cov` — with coverage report

**Note:** Current coverage is partial; many modules have specs. Add more `.spec.ts` files as needed.

---

## 3. E2E Tests

E2E tests use a real database (Supabase/PostgreSQL). They **require** a valid `DATABASE_URL` in `backend/.env`.

```bash
cd backend
npm run test:e2e          # Runs e2e-automated.e2e-spec.ts
npm run test:e2e:deep    # Runs e2e-deep-scenarios.e2e-spec.ts
npm run test:e2e:all     # Runs all E2E specs
```

**Requirements:**
- `DATABASE_URL` must point to a **test** database (not production).
- Schema must be applied: run `npx prisma migrate deploy` or `npx prisma db push` for the test DB.
- Tests clean and create data; use a dedicated test database.

**If E2E fails:**
- Confirm `DATABASE_URL` is set and reachable.
- Apply migrations: `npx prisma migrate deploy` or `npx prisma db push`.
- For schema drift, run `npx prisma generate` and re-apply migrations.
- See [backend/test/README.md](../../backend/test/README.md) for test details.

---

## 4. Linting

```bash
cd backend
npm run lint
```

Uses ESLint with Prettier. Fix auto-fixable issues with `npm run lint` (includes `--fix`).

---

## 5. Database Migrations

**Development (with schema changes):**
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

**Production / CI:**
```bash
cd backend
npx prisma migrate deploy
```

**Sync schema without migration files (dev only):**
```bash
npx prisma db push
```

**Generate Prisma client after schema changes:**
```bash
npx prisma generate
```

---

## 6. Deployment Checklist

### Pre-deploy

- [ ] All tests passing: `npm run test` and (if DB available) `npm run test:e2e`
- [ ] Build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Environment variables set for target (e.g. production `.env` or secrets)
- [ ] Database migrations applied to target DB
- [ ] `npx prisma generate` run in build step (or in Dockerfile)

### Deploy steps

1. **Build**
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```

2. **Run**
   ```bash
   node dist/main
   ```
   Or use `npm run start:prod`.

3. **Health check**
   - `GET /api/v1/health` or `GET /health` (if no prefix at root) should return `200` and a status payload.

### Post-deploy

- [ ] Health endpoint returns 200
- [ ] Auth flow works (e.g. Google OAuth → JWT)
- [ ] Critical paths tested: create org, client, animal, treatment (and v1.1: payment, revenue, org approval if in use)

---

## 7. Environment Variables

Required for backend:

| Variable | Description | Required for |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | All (run, migrate, E2E) |
| `SUPABASE_URL` | Supabase project URL | Auth |
| `SUPABASE_JWT_SECRET` | JWT verification secret | Auth |
| `JWT_SECRET` or Supabase JWT | Used for token validation | Auth |
| `PORT` | Server port (default 3001) | Run |
| `NODE_ENV` | `development` / `production` | Run |

See `backend/.env.example` for a full list.

---

## 8. CI/CD Suggestions

Example GitHub Actions steps:

```yaml
- name: Install dependencies
  run: cd backend && npm ci

- name: Generate Prisma Client
  run: cd backend && npx prisma generate

- name: Lint
  run: cd backend && npm run lint

- name: Build
  run: cd backend && npm run build

- name: Unit tests
  run: cd backend && npm run test

# Optional: E2E with a test database
- name: E2E tests
  run: cd backend && npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

---

## 9. Test Results Summary

| Suite | Command | Requires DB | Notes |
|-------|---------|-------------|--------|
| Unit | `npm run test` | No | Fast; run on every PR |
| App E2E | `npx jest --config ./test/jest-e2e.json app.e2e-spec` | No | Root endpoint + response envelope |
| E2E automated | `npm run test:e2e` | Yes | Full app + DB; **DB must have latest schema** |
| E2E deep | `npm run test:e2e:deep` | Yes | Extended scenarios |
| Build | `npm run build` | No | Must pass before deploy |

### Last run (February 9, 2026)

| Test | Result | Notes |
|------|--------|--------|
| `npm run build` | Pass | Production build succeeds |
| `npm run test` | Pass | 1 suite, 1 test (AppController) |
| `app.e2e-spec.ts` | Pass | Root GET returns envelope with `data: "Hello World!"` |
| `test:e2e` (full) | Fail* | Requires DB with **v1.1 schema** applied (see below) |

\* **E2E (e2e-automated / e2e-deep)** connect to a real database. If the database has not had the v1.1 migration applied (`PatientType`, `PaymentStatus`, `OrgStatus`, new columns on Organization, Animal, TreatmentRecord), Prisma will throw "column does not exist" errors. **Fix:** Run `npx prisma db push` or `npx prisma migrate deploy` against the **test** database, then re-run E2E.

---

## 10. Troubleshooting

**Build fails with Prisma errors**
- Run `npx prisma generate` in `backend/`.
- Ensure `schema.prisma` is valid: `npx prisma validate`.

**E2E fails with connection errors**
- Check `DATABASE_URL` in `backend/.env`.
- Ensure DB is reachable (network, firewall, Supabase pooler).
- Run migrations on the test DB.

**E2E fails with schema errors**
- Apply latest schema: `npx prisma db push` or `npx prisma migrate deploy`.
- Regenerate client: `npx prisma generate`.

**Tests pass locally but fail in CI**
- Use the same Node version (e.g. 20).
- Ensure CI has `DATABASE_URL` for E2E.
- Run `npm ci` (not `npm install`) for reproducible deps.

---

## Related Documentation

- [Backend README](../../backend/README.md) — Setup and run
- [Backend docs](../../backend/docs/README.md) — API and features
- [Migration guide (v1.1)](../../backend/docs/MIGRATION_GUIDE.md) — DB migrations
- [Test README](../../backend/test/README.md) — E2E test details
