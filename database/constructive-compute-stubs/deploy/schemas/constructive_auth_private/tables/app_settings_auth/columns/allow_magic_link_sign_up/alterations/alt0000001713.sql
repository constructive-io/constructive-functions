-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_up/alterations/alt0000001713
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_up/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ALTER COLUMN allow_magic_link_sign_up SET DEFAULT false;

