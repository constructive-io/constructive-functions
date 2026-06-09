-- Revert: schemas/constructive_memberships_public/tables/org_chart_edges/columns/entity_id/alterations/alt0000000906


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN entity_id DROP NOT NULL;


