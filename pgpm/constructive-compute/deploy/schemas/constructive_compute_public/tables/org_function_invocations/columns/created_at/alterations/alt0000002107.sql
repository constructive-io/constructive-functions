-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/columns/created_at/alterations/alt0000002107
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/columns/created_at/column


COMMENT ON COLUMN "constructive_compute_public".org_function_invocations.created_at IS E'Invocation creation timestamp (partition key)';

