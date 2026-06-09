-- Revert: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/id/alterations/alt0000001864


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN id DROP NOT NULL;


