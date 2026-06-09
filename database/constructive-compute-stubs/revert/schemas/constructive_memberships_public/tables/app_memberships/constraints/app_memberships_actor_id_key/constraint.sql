-- Revert: schemas/constructive_memberships_public/tables/app_memberships/constraints/app_memberships_actor_id_key/constraint


ALTER TABLE "constructive_memberships_public".app_memberships 
  DROP CONSTRAINT app_memberships_actor_id_key;


