-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/alterations/alt0000001880
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  DISABLE ROW LEVEL SECURITY;

