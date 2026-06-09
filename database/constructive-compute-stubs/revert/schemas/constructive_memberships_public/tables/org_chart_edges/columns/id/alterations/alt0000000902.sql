-- Revert: schemas/constructive_memberships_public/tables/org_chart_edges/columns/id/alterations/alt0000000902


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN id DROP NOT NULL;


