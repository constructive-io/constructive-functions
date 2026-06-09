-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/child_id/alterations/alt0000000930
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/child_id/column


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ALTER COLUMN child_id SET NOT NULL;

