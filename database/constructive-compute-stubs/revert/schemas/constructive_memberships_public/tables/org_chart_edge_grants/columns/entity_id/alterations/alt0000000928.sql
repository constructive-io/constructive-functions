-- Revert: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/entity_id/alterations/alt0000000928


ALTER TABLE "constructive_memberships_public".org_chart_edge_grants 
  ALTER COLUMN entity_id DROP NOT NULL;


