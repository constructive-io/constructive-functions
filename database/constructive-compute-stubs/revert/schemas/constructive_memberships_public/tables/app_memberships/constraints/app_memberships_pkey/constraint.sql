-- Revert: schemas/constructive_memberships_public/tables/app_memberships/constraints/app_memberships_pkey/constraint


ALTER TABLE "constructive_memberships_public".app_memberships 
  DROP CONSTRAINT app_memberships_pkey;


