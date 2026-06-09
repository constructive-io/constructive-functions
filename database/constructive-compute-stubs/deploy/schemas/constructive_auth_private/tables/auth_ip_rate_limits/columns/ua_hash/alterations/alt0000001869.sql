-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/alterations/alt0000001869
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN ua_hash SET DEFAULT '';

