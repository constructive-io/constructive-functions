-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/is_grant/alterations/alt0000000935
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/is_grant/column


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ALTER COLUMN is_grant SET DEFAULT true;

