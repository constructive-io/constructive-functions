-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/updated_at/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  DROP COLUMN updated_at RESTRICT;


