-- Deploy: schemas/constructive_users_public/tables/users/columns/id/alterations/alt0000000003
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/users/table
-- requires: schemas/constructive_users_public/tables/users/columns/id/column


ALTER TABLE "constructive_users_public".users 
  ALTER COLUMN id SET DEFAULT uuidv7();

