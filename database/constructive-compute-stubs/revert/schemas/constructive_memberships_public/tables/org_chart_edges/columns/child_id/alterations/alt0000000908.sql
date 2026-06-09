-- Revert: schemas/constructive_memberships_public/tables/org_chart_edges/columns/child_id/alterations/alt0000000908


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN child_id DROP NOT NULL;


