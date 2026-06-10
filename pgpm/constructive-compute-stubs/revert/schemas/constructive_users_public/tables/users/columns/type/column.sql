-- Revert: schemas/constructive_users_public/tables/users/columns/type/column


ALTER TABLE "constructive_users_public".users 
  DROP COLUMN type RESTRICT;


