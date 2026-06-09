-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  DROP COLUMN ua_hash RESTRICT;


