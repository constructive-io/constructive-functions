-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/constraints/auth_ip_rate_limits_ip_address_ua_hash_action_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ip_address/column
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/column
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/action/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ADD CONSTRAINT auth_ip_rate_limits_ip_address_ua_hash_action_key 
    UNIQUE (ip_address, ua_hash, action);

