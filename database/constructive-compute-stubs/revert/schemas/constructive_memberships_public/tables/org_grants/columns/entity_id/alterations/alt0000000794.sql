-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/entity_id/alterations/alt0000000794


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN entity_id DROP NOT NULL;


