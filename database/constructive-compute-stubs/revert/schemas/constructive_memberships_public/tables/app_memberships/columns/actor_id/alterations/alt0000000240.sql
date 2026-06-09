-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/actor_id/alterations/alt0000000240


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN actor_id DROP NOT NULL;


