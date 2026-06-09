-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/remember_me_duration/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN remember_me_duration RESTRICT;


