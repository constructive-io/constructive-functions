-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/columns/result/alterations/alt0000002115
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/columns/result/column


COMMENT ON COLUMN "constructive_compute_public".org_function_invocations.result IS E'Function return value (success) or structured error (failure)';

