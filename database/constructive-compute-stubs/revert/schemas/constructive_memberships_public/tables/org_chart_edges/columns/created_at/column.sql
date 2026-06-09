-- Revert: schemas/constructive_memberships_public/tables/org_chart_edges/columns/created_at/column


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  DROP COLUMN created_at RESTRICT;


