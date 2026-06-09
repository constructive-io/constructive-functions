-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/created_at/alterations/alt0000001878


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN created_at DROP DEFAULT;


