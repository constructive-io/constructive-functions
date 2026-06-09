-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ip_address/alterations/alt0000001866
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/ip_address/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN ip_address SET NOT NULL;

