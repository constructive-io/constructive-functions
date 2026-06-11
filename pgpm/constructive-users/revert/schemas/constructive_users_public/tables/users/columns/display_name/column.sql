-- Revert: schemas/constructive_users_public/tables/users/columns/display_name/column


ALTER TABLE "constructive_users_public".users 
  DROP COLUMN display_name RESTRICT;


