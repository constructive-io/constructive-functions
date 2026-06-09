-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/entity_id/alterations/alt0000000819


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  ALTER COLUMN entity_id DROP NOT NULL;


