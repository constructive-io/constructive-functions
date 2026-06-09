-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/last_attempt_at/alterations/alt0000001892
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/last_attempt_at/column


COMMENT ON COLUMN "constructive_auth_private".auth_rate_limits.last_attempt_at IS E'Timestamp of the most recent attempt; used for cooldown period enforcement';

