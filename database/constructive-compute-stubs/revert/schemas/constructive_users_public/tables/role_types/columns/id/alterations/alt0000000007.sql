-- Revert: schemas/constructive_users_public/tables/role_types/columns/id/alterations/alt0000000007


ALTER TABLE "constructive_users_public".role_types 
  ALTER COLUMN id DROP NOT NULL;


