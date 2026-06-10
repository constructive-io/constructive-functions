-- Deploy: schemas/constructive_users_public/tables/role_types/columns/name/alterations/alt0000000008
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/role_types/table
-- requires: schemas/constructive_users_public/tables/role_types/columns/name/column


ALTER TABLE "constructive_users_public".role_types 
  ALTER COLUMN name SET NOT NULL;

