-- Deploy: schemas/constructive_users_public/tables/role_types/constraints/role_types_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/role_types/table
-- requires: schemas/constructive_users_public/tables/role_types/columns/id/column


ALTER TABLE "constructive_users_public".role_types 
  ADD CONSTRAINT role_types_pkey PRIMARY KEY (id);

