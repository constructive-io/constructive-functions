-- Deploy: schemas/constructive_users_public/tables/users/constraints/users_username_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/users/table
-- requires: schemas/constructive_users_public/tables/users/columns/username/column


ALTER TABLE "constructive_users_public".users 
  ADD CONSTRAINT users_username_key 
    UNIQUE (username);

