-- Revert: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/is_grant/column


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  DROP COLUMN is_grant RESTRICT;


