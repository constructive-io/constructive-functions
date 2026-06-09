-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/id/alterations/alt0000001882
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/id/column


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ALTER COLUMN id SET NOT NULL;

