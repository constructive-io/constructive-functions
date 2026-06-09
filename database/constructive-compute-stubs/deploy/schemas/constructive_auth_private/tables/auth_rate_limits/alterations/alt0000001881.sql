-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/alterations/alt0000001881
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table


COMMENT ON TABLE "constructive_auth_private".auth_rate_limits IS E'Tracks per-user/subject rate limiting state for auth functions using UUID subject identifiers';

