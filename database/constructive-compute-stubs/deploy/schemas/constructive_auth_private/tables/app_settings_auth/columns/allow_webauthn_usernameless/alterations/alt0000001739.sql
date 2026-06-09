-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_usernameless/alterations/alt0000001739
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_webauthn_usernameless/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_webauthn_usernameless SET NOT NULL;

