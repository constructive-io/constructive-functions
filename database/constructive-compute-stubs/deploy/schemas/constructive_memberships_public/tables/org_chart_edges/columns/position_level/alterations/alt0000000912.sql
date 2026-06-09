-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edges/columns/position_level/alterations/alt0000000912
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/columns/position_level/column


COMMENT ON COLUMN "constructive_memberships_public".org_chart_edges.position_level IS E'Numeric seniority level for this position (higher = more senior)';

