-- Revert: schemas/constructive_auth_private/tables/app_settings_rate_limit/constraints/app_settings_rate_limits_pkey/constraint


ALTER TABLE "constructive_auth_private".app_settings_rate_limit 
  DROP CONSTRAINT app_settings_rate_limits_pkey;


