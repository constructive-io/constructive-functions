-- Revert: schemas/constructive_auth_private/tables/auth_rate_limits/columns/id/alterations/alt0000001883


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ALTER COLUMN id DROP DEFAULT;


