-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/is_grant/alterations/alt0000000740


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


