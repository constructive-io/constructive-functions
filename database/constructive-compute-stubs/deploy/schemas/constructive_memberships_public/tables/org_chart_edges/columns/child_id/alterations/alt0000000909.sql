-- Deploy: schemas/constructive_memberships_public/tables/org_chart_edges/columns/child_id/alterations/alt0000000909
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_chart_edges/columns/child_id/column


COMMENT ON COLUMN "constructive_memberships_public".org_chart_edges.child_id IS E'User ID of the subordinate (employee) in this reporting relationship';

