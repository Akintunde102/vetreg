#!/bin/bash
# Run this in your terminal (where Supabase is reachable) to set up DB and run tests.
set -e
cd "$(dirname "$0")/.."
echo "=== 1. Pushing database schema to Supabase ==="
npx prisma db push
echo ""
echo "=== 2. Generating Prisma client ==="
npx prisma generate
echo ""
echo "=== 3. Running E2E tests ==="
npm run test:e2e
echo ""
echo "=== Done ==="
