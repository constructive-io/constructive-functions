-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/id/alterations/alt0000000738


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ALTER COLUMN id DROP NOT NULL;


