-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ip_address/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  DROP COLUMN ip_address RESTRICT;


