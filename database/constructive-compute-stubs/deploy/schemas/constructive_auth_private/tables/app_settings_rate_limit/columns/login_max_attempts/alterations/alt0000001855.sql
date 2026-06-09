-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/login_max_attempts/alterations/alt0000001855
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/login_max_attempts/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_rate_limit.login_max_attempts IS 'Number of consecutive failed login attempts before the account is locked';

