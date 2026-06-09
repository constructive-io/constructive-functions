-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edge_grants/constraints/org_chart_edge_grants_grantor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_users_public/tables/users/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/grantor_id/column
-- requires: schemas/constructive_users_public/tables/users/columns/id/column
-- requires: schemas/constructive_users_public/tables/users/constraints/users_pkey/constraint
-- requires: schemas/constructive_users_public/tables/users/constraints/users_username_key/constraint


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ADD CONSTRAINT org_chart_edge_grants_grantor_id_fkey 
    FOREIGN KEY(grantor_id) 
    REFERENCES "constructive_users_public".users (id) 
    ON DELETE SET NULL;

