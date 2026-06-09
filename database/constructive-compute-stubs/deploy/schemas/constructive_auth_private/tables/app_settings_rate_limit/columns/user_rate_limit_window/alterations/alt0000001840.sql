-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_rate_limit_window/alterations/alt0000001840
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/user_rate_limit_window/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_rate_limit.user_rate_limit_window IS E'Sliding window duration for counting user/subject-based rate limit attempts';

