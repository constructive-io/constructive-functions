-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edge_grants/constraints/org_chart_edge_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ADD CONSTRAINT org_chart_edge_grants_pkey PRIMARY KEY (id);

