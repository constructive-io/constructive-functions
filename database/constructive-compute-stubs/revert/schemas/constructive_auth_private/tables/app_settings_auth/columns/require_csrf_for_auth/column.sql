-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/require_csrf_for_auth/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN require_csrf_for_auth RESTRICT;


