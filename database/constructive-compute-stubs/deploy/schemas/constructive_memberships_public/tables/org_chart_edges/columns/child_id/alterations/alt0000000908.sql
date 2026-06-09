-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edges/columns/child_id/alterations/alt0000000908
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/columns/child_id/column


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN child_id SET NOT NULL;

