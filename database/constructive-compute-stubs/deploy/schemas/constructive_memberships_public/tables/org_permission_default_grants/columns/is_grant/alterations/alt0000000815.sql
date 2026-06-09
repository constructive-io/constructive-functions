-- Deploy: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/is_grant/alterations/alt0000000815
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/is_grant/column


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  ALTER COLUMN is_grant SET NOT NULL;

