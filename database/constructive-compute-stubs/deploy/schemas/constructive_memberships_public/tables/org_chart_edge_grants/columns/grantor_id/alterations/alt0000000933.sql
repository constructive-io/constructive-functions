-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/grantor_id/alterations/alt0000000933
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edge_grants/columns/grantor_id/column


COMMENT ON COLUMN "constructive_memberships_public".org_chart_edge_grants.grantor_id IS E'User ID of the admin who performed this grant or revocation; NULL if grantor was deleted';

