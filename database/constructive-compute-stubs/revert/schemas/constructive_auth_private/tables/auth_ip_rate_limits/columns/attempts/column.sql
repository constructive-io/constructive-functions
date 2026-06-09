-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/attempts/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  DROP COLUMN attempts RESTRICT;


