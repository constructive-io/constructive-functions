-- Revert: schemas/constructive_memberships_public/tables/app_grants/constraints/app_grants_grantor_id_fkey/constraint


ALTER TABLE "constructive_memberships_public".app_grants 
  DROP CONSTRAINT app_grants_grantor_id_fkey;


