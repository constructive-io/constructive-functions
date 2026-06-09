-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/action/alterations/alt0000001871
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/action/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN action SET NOT NULL;

