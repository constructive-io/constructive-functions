-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_captcha/alterations/alt0000001805
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/enable_captcha/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN enable_captcha SET NOT NULL;

