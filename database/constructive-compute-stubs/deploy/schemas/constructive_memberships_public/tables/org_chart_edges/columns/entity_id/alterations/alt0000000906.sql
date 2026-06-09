-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edges/columns/entity_id/alterations/alt0000000906
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN entity_id SET NOT NULL;

