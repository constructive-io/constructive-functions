-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_state_max_age/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN oauth_state_max_age RESTRICT;


