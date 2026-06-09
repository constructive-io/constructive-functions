-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/entity_id/alterations/alt0000000720


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN entity_id DROP NOT NULL;


