-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/is_read_only/alterations/alt0000000723


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_read_only DROP DEFAULT;


