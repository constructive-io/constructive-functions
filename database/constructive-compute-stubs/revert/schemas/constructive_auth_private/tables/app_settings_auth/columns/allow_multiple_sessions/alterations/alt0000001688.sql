-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_multiple_sessions/alterations/alt0000001688


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_multiple_sessions DROP NOT NULL;


