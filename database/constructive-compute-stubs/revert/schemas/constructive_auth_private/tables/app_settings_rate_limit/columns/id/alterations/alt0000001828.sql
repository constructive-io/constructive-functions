-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/id/alterations/alt0000001828


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN id DROP DEFAULT;


