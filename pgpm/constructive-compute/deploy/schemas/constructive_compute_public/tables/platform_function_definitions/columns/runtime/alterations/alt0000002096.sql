-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/runtime/alterations/alt0000002096
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/runtime/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.runtime IS E'Dispatch mode: http (external service) or inline (in-process on compute-worker)';
