-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/subject_id/alterations/alt0000001884
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/columns/subject_id/column


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ALTER COLUMN subject_id SET NOT NULL;

