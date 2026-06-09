-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/min_password_length/alterations/alt0000001693
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/min_password_length/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.min_password_length IS 'Minimum number of characters required for user passwords';

