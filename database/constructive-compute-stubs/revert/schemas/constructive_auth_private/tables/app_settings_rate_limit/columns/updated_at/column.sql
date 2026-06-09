-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/updated_at/column


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  DROP COLUMN updated_at RESTRICT;


