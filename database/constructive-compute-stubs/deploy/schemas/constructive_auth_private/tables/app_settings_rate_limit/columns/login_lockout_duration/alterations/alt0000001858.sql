-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/login_lockout_duration/alterations/alt0000001858
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/login_lockout_duration/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_rate_limit.login_lockout_duration IS 'How long the account stays locked after exceeding max failed login attempts';

