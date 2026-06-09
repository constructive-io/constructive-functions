-- Deploy: schemas/constructive_memberships_public/tables/org_owner_grants/constraints/org_owner_grants_actor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_users_public/tables/users/table
-- requires: schemas/constructive_memberships_public/tables/org_owner_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_owner_grants/columns/actor_id/column
-- requires: schemas/constructive_users_public/tables/users/columns/id/column
-- requires: schemas/constructive_users_public/tables/users/constraints/users_pkey/constraint
-- requires: schemas/constructive_users_public/tables/users/constraints/users_username_key/constraint


ALTER TABLE "constructive_memberships_public".org_owner_grants 
  ADD CONSTRAINT org_owner_grants_actor_id_fkey 
    FOREIGN KEY(actor_id) 
    REFERENCES "constructive_users_public".users (id) 
    ON DELETE SET NULL;

