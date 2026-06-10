-- Revert: schemas/constructive_users_public/tables/users/columns/id/column


ALTER TABLE "constructive_users_public".users 
  DROP COLUMN id RESTRICT;


