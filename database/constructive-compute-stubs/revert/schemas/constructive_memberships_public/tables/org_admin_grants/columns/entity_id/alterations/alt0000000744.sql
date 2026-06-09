-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/entity_id/alterations/alt0000000744


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ALTER COLUMN entity_id DROP NOT NULL;


