-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/alterations/alt0000001869


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN ua_hash DROP DEFAULT;


