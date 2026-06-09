-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_cross_origin_token/alterations/alt0000001744
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/allow_cross_origin_token/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.allow_cross_origin_token IS E'Whether cross-origin session handoff tokens are allowed';

