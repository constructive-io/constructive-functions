-- Deploy: schemas/constructive_memberships_public/tables/org_members/constraints/org_members_entity_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_users_public/tables/users/table
-- requires: schemas/constructive_memberships_public/tables/org_members/table
-- requires: schemas/constructive_memberships_public/tables/org_members/columns/entity_id/column
-- requires: schemas/constructive_users_public/tables/users/columns/id/column
-- requires: schemas/constructive_users_public/tables/users/constraints/users_pkey/constraint
-- requires: schemas/constructive_users_public/tables/users/constraints/users_username_key/constraint


ALTER TABLE "constructive_memberships_public".org_members 
  ADD CONSTRAINT org_members_entity_id_fkey 
    FOREIGN KEY(entity_id) 
    REFERENCES "constructive_users_public".users (id) 
    ON DELETE CASCADE;

