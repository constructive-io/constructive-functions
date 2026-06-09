-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edges/constraints/org_chart_edges_child_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_users_public/tables/users/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/columns/child_id/column
-- requires: schemas/constructive_users_public/tables/users/columns/id/column
-- requires: schemas/constructive_users_public/tables/users/constraints/users_pkey/constraint
-- requires: schemas/constructive_users_public/tables/users/constraints/users_username_key/constraint


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ADD CONSTRAINT org_chart_edges_child_id_fkey 
    FOREIGN KEY(child_id) 
    REFERENCES "constructive_users_public".users (id) 
    ON DELETE CASCADE;

