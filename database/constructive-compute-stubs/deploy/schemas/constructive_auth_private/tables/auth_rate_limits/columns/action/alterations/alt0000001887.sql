-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/action/alterations/alt0000001887
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/action/column


COMMENT ON COLUMN "constructive_auth_private".auth_rate_limits.action IS E'The auth function name this rate limit tracks (e.g. sign_in, verify_password, reset_password)';

