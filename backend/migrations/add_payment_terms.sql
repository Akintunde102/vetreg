-- Migration: Add payment_terms column to organizations table
-- Date: 2026-02-09
-- Description: P0 feature - Add paymentTerms field to support frontend display

ALTER TABLE organizations 
ADD COLUMN payment_terms VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN organizations.payment_terms IS 'Payment terms for the organization (e.g., "Monthly invoicing", "Instant billing")';

-- Optional: Set default value for existing organizations
UPDATE organizations 
SET payment_terms = 'Monthly invoicing' 
WHERE payment_terms IS NULL;
