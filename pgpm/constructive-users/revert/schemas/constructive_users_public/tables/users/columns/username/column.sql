-- Revert: schemas/constructive_users_public/tables/users/columns/username/column


ALTER TABLE "constructive_users_public".users 
  DROP COLUMN username RESTRICT;


