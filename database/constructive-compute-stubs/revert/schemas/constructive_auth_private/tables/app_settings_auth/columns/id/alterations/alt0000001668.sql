-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/id/alterations/alt0000001668


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN id DROP NOT NULL;


