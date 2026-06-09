-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/updated_at/alterations/alt0000001879


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN updated_at DROP DEFAULT;


