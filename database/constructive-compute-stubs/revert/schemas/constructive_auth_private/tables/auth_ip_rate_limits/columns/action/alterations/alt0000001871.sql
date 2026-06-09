-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/action/alterations/alt0000001871


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN action DROP NOT NULL;


