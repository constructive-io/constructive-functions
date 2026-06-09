-- Revert: schemas/constructive_memberships_public/tables/org_chart_edges/columns/child_id/alterations/alt0000000913


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  DROP CONSTRAINT org_chart_edges_child_id_parent_id_chk;


