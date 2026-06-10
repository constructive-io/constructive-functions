-- Deploy: schemas/constructive_users_public/tables/users/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/users/table


ALTER TABLE "constructive_users_public".users 
  ADD COLUMN created_at timestamptz;

