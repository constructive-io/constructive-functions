-- Revert: schemas/constructive_users_public/tables/users/columns/created_at/alterations/alt0000000012


ALTER TABLE "constructive_users_public".users 
  ALTER COLUMN created_at DROP DEFAULT;


