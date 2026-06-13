-- Revert: schemas/constructive_users_public/tables/users/columns/search_tsv/column


ALTER TABLE "constructive_users_public".users 
  DROP COLUMN search_tsv RESTRICT;


