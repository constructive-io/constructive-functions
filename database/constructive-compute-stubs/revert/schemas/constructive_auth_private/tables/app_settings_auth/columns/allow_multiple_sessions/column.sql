-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_multiple_sessions/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN allow_multiple_sessions RESTRICT;


