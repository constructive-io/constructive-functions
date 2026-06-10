-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/columns/parent_invocation_id/alterations/alt0000002163
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/columns/parent_invocation_id/column


COMMENT ON COLUMN "constructive_compute_public".org_function_invocations.parent_invocation_id IS 'Parent invocation when this is a child node of a flow graph execution';

