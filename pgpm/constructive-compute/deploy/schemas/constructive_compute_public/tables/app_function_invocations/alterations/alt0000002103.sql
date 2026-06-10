-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/alterations/alt0000002103
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/table


COMMENT ON TABLE "constructive_compute_public".app_function_invocations IS E'Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string.';

