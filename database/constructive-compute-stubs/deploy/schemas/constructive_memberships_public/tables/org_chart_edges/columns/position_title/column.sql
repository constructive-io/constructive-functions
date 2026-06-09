-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edges/columns/position_title/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/table


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ADD COLUMN position_title text;

