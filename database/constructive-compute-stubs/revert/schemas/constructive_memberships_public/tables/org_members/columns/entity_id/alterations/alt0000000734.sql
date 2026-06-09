-- Revert: schemas/constructive_memberships_public/tables/org_members/columns/entity_id/alterations/alt0000000734


ALTER TABLE "constructive_memberships_public".org_members 
  ALTER COLUMN entity_id DROP NOT NULL;


