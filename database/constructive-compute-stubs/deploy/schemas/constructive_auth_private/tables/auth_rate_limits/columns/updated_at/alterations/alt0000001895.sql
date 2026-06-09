-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/updated_at/alterations/alt0000001895
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/updated_at/column


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ALTER COLUMN updated_at SET DEFAULT now();

