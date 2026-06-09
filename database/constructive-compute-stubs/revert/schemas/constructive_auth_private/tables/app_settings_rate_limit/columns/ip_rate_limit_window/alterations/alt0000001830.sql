-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/ip_rate_limit_window/alterations/alt0000001830


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  ALTER COLUMN ip_rate_limit_window DROP DEFAULT;


