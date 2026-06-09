-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/locked_until/alterations/alt0000001877
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/locked_until/column


COMMENT ON COLUMN "constructive_auth_private".auth_ip_rate_limits.locked_until IS E'Timestamp until which this IP is locked out for this action; NULL means not locked';

