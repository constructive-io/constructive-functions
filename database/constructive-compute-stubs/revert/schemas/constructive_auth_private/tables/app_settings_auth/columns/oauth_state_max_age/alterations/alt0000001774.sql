-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_state_max_age/alterations/alt0000001774


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN oauth_state_max_age DROP DEFAULT;


