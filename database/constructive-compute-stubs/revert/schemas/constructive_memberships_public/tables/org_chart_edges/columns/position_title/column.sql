-- Revert: schemas/constructive_memberships_public/tables/org_chart_edges/columns/position_title/column


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  DROP COLUMN position_title RESTRICT;


