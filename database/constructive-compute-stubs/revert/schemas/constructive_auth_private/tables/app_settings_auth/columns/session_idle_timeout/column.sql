-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/session_idle_timeout/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN session_idle_timeout RESTRICT;


