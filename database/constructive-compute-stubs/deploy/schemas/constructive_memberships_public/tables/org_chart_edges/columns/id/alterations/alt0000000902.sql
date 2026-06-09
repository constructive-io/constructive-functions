-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edges/columns/id/alterations/alt0000000902
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/columns/id/column


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN id SET NOT NULL;

