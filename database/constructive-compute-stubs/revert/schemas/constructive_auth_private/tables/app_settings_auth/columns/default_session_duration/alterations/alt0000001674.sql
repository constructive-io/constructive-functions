-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_session_duration/alterations/alt0000001674


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN default_session_duration DROP DEFAULT;


