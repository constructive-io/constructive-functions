-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/ip_lockout_duration/alterations/alt0000001837
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/ip_lockout_duration/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_rate_limit.ip_lockout_duration IS 'How long an IP address is locked out after exceeding the maximum attempts';

