-- Revert: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/id/alterations/alt0000000926


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ALTER COLUMN id DROP NOT NULL;


