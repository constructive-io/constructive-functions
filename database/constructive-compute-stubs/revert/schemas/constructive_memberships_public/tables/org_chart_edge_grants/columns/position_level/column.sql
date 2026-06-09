-- Revert: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/position_level/column


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  DROP COLUMN position_level RESTRICT;


