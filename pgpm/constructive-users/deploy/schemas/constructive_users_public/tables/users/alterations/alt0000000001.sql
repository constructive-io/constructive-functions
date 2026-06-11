-- Deploy: schemas/constructive_users_public/tables/users/alterations/alt0000000001
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/users/table


ALTER TABLE "constructive_users_public".users 
  DISABLE ROW LEVEL SECURITY;

