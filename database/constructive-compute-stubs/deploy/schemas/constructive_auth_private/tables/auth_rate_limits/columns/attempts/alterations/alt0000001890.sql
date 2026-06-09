-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/attempts/alterations/alt0000001890
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/attempts/column


COMMENT ON COLUMN "constructive_auth_private".auth_rate_limits.attempts IS 'Number of attempts from this subject for this action within the current rate limit window';

