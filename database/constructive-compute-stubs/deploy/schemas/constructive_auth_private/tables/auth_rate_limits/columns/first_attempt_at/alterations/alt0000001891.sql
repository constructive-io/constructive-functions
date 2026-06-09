-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/first_attempt_at/alterations/alt0000001891
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/first_attempt_at/column


COMMENT ON COLUMN "constructive_auth_private".auth_rate_limits.first_attempt_at IS E'Timestamp of the first attempt in the current window; NULL means no active window';

