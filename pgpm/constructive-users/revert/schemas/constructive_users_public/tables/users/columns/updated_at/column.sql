-- Revert: schemas/constructive_users_public/tables/users/columns/updated_at/column


ALTER TABLE "constructive_users_public".users 
  DROP COLUMN updated_at RESTRICT;


