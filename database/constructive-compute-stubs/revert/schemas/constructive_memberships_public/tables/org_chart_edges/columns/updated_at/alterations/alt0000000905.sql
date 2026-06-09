-- Revert: schemas/constructive_memberships_public/tables/org_chart_edges/columns/updated_at/alterations/alt0000000905


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN updated_at DROP DEFAULT;


