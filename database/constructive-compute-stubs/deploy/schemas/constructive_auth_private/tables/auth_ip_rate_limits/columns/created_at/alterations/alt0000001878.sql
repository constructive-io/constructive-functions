-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/created_at/alterations/alt0000001878
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/created_at/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN created_at SET DEFAULT now();

