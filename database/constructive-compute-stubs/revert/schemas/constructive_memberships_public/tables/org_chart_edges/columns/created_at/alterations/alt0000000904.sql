-- Revert: schemas/constructive_memberships_public/tables/org_chart_edges/columns/created_at/alterations/alt0000000904


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN created_at DROP DEFAULT;


