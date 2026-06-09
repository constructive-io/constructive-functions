-- Deploy: schemas/constructive_auth_private/tables/auth_rate_limits/columns/subject_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/auth_rate_limits/table


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ADD COLUMN subject_id uuid;

