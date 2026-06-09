-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/min_password_length/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN min_password_length RESTRICT;


