-- Deploy: schemas/constructive_users_public/tables/users/constraints/users_type_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/users/table
-- requires: schemas/constructive_users_public/tables/role_types/table
-- requires: schemas/constructive_users_public/tables/users/columns/type/column
-- requires: schemas/constructive_users_public/tables/role_types/columns/id/column
-- requires: schemas/constructive_users_public/tables/role_types/constraints/role_types_name_key/constraint
-- requires: schemas/constructive_users_public/tables/role_types/constraints/role_types_pkey/constraint


ALTER TABLE "constructive_users_public".users 
  ADD CONSTRAINT users_type_fkey 
    FOREIGN KEY(type) 
    REFERENCES "constructive_users_public".role_types (id) 
    ON DELETE RESTRICT;

