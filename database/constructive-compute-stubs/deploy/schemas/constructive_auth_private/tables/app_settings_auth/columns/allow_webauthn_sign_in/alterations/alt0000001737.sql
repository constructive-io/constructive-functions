-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_sign_in/alterations/alt0000001737
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_sign_in/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_webauthn_sign_in SET DEFAULT false;

