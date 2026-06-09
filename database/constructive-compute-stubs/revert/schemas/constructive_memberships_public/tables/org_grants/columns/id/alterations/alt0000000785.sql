-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/id/alterations/alt0000000785


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN id DROP NOT NULL;


