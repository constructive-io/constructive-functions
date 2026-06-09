-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edges/columns/updated_at/alterations/alt0000000905
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/table
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_chart_edges 
  ALTER COLUMN updated_at SET DEFAULT now();

