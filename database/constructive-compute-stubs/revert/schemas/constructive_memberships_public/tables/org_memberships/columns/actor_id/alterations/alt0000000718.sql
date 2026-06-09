-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/actor_id/alterations/alt0000000718


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN actor_id DROP NOT NULL;


