-- Revert: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/is_grant/alterations/alt0000000934


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


