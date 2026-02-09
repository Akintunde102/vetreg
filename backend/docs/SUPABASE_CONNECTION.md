# Supabase connection (aligned with official docs)

We follow Supabase’s recommended setup for a **three-tier** app: **our NestJS API** talks to **Supabase Postgres**; we do **not** use Supabase’s auto-generated REST API for backend logic.

- [REST API overview](https://supabase.com/docs/guides/api) – we use our own API; Supabase REST is optional.
- [Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres) – we use the **Session pooler** (IPv4).
- [Prisma + Supabase](https://supabase.com/docs/guides/database/prisma) – Session pooler string in `.env`.

## Why Session pooler (port 5432)

- **Direct** connection (`db.xxx.supabase.co:5432`) uses **IPv6 only** → often “Network is unreachable” on home/office networks.
- **Session pooler** (`aws-1-eu-west-1.pooler.supabase.com:5432`) supports **IPv4** and is the recommended way to connect with Prisma.

## Get the exact connection string

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project (**VetDb**).
2. Click **Connect** (or **Settings** → **Database**).
3. Under **Connection string**, choose **Session mode** (Supavisor, port **5432**).
4. Copy the URI. It looks like:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
   ```
5. In `backend/.env`:
   - Set `DATABASE_URL` and `DIRECT_URL` to that URI.
   - **Important:** Use your **database password** (Project Settings → Database → Database password), not the API key.
   - If the password contains special characters, URL-encode them (e.g. `*` → `%2A`, `!` → `%21`, `@` → `%40`).
   - Append `?sslmode=require` if it’s not already there:
     ```env
     DATABASE_URL="postgresql://postgres.blyhaayyzwvcdyrkejgr:YOUR_URL_ENCODED_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
     DIRECT_URL="postgresql://postgres.blyhaayyzwvcdyrkejgr:YOUR_URL_ENCODED_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
     ```

## Verify

From the project root:

```bash
cd backend
npx prisma db push
```

If you see **P1000 (Authentication failed)**:

- Confirm the password in the URI is the **database** password from the dashboard.
- Re-copy the Session mode URI from the dashboard and only add `?sslmode=require` if needed.
