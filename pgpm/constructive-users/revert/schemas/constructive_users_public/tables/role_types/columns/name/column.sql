-- Revert: schemas/constructive_users_public/tables/role_types/columns/name/column


ALTER TABLE "constructive_users_public".role_types 
  DROP COLUMN name RESTRICT;


