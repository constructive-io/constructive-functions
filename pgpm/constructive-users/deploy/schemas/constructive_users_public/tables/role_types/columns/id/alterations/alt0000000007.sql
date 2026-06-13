-- Deploy: schemas/constructive_users_public/tables/role_types/columns/id/alterations/alt0000000007
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/role_types/table
-- requires: schemas/constructive_users_public/tables/role_types/columns/id/column


ALTER TABLE "constructive_users_public".role_types 
  ALTER COLUMN id SET NOT NULL;

