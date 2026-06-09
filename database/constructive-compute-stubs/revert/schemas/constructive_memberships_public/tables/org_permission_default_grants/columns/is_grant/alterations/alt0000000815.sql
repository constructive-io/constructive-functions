-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/is_grant/alterations/alt0000000815


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


