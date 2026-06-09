-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/created_at/alterations/alt0000001809


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN created_at DROP DEFAULT;


