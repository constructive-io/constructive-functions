-- Revert: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/created_at/alterations/alt0000000939


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ALTER COLUMN created_at DROP NOT NULL;


