-- Revert: schemas/constructive_auth_private/tables/auth_rate_limits/columns/created_at/alterations/alt0000001894


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ALTER COLUMN created_at DROP DEFAULT;


