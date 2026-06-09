-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/updated_at/alterations/alt0000000632


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN updated_at DROP DEFAULT;


