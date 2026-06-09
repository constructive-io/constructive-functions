-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/locked_until/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ADD COLUMN locked_until timestamptz;

