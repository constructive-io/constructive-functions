-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/indexes/auth_ip_rate_limits_locked_until_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/locked_until/column


CREATE INDEX auth_ip_rate_limits_locked_until_idx ON "constructive_auth_private".auth_ip_rate_limits USING BTREE ( locked_until );

