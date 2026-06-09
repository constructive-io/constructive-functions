-- Revert: schemas/constructive_auth_private/tables/app_settings_auth/columns/captcha_site_key/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  DROP COLUMN captcha_site_key RESTRICT;


