-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_anonymous_sessions/alterations/alt0000001686


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_anonymous_sessions DROP DEFAULT;


