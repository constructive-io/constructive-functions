-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/updated_at/alterations/alt0000001860


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN updated_at DROP DEFAULT;


