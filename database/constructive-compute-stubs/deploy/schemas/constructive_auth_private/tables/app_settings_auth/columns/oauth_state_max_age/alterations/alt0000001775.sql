-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_state_max_age/alterations/alt0000001775
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/oauth_state_max_age/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.oauth_state_max_age IS E'How long the HMAC-signed OAuth state token is valid before expiring; controls CSRF protection window for OAuth flows';

