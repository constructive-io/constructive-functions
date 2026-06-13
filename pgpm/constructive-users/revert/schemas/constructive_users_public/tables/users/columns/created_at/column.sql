-- Revert: schemas/constructive_users_public/tables/users/columns/created_at/column


ALTER TABLE "constructive_users_public".users 
  DROP COLUMN created_at RESTRICT;


