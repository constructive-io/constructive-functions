-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/indexes/auth_ip_rate_limits_ip_address_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ip_address/column


CREATE INDEX auth_ip_rate_limits_ip_address_idx ON "constructive_auth_private".auth_ip_rate_limits USING BTREE ( ip_address );

