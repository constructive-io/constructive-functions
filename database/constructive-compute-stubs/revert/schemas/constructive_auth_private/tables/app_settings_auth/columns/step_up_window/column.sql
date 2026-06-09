-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/step_up_window/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN step_up_window RESTRICT;


