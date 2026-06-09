-- Deploy: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/attempts/alterations/alt0000001874
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_ip_rate_limits/columns/attempts/column


ALTER TABLE "constructive_auth_private".auth_ip_rate_limits 
  ALTER COLUMN attempts SET DEFAULT 0;

