-- Revert: schemas/constructive_memberships_public/tables/org_owner_grants/columns/entity_id/alterations/alt0000000757


ALTER TABLE "constructive_memberships_public".org_owner_grants 
  ALTER COLUMN entity_id DROP NOT NULL;


