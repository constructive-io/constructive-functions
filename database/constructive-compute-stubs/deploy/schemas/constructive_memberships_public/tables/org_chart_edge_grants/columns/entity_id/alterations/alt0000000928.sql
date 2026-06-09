-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/entity_id/alterations/alt0000000928
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ALTER COLUMN entity_id SET NOT NULL;

