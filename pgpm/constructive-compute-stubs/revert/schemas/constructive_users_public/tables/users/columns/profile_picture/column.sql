-- Revert: schemas/constructive_users_public/tables/users/columns/profile_picture/column


ALTER TABLE "constructive_users_public".users 
  DROP COLUMN profile_picture RESTRICT;


