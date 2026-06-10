-- Deploy: schemas/constructive_users_public/tables/users/constraints/users_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/users/table
-- requires: schemas/constructive_users_public/tables/users/columns/id/column


ALTER TABLE "constructive_users_public".users 
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

