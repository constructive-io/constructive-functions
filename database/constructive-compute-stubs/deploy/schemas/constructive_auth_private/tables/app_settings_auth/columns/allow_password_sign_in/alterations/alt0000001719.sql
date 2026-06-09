-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_password_sign_in/alterations/alt0000001719
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_password_sign_in/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_password_sign_in SET DEFAULT true;

