-- Revert: schemas/constructive_memberships_public/tables/org_members/columns/actor_id/alterations/alt0000000732


ALTER TABLE "constructive_memberships_public".org_members 
  ALTER COLUMN actor_id DROP NOT NULL;


