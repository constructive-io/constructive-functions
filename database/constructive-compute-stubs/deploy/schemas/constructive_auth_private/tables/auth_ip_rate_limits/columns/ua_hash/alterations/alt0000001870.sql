-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/alterations/alt0000001870
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/column


COMMENT ON COLUMN "constructive_auth_private".auth_ip_rate_limits.ua_hash IS E'SHA-256 hash of User-Agent for per-client tracking; empty string for IP-only aggregate rows';

