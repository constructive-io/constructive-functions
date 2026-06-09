-- Revert: schemas/constructive_auth_private/tables/auth_rate_limits/columns/attempts/alterations/alt0000001889


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ALTER COLUMN attempts DROP DEFAULT;


