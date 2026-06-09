-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/is_grant/alterations/alt0000000936
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/is_grant/column


COMMENT ON COLUMN "constructive_memberships_public".org_chart_edge_grants.is_grant IS E'TRUE to add/update the edge, FALSE to remove it';

