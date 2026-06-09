-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/is_admin/alterations/alt0000000710


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_admin DROP DEFAULT;


