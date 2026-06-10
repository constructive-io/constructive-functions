-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/priority/alterations/alt0000002067
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/priority/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.priority IS E'Job priority (lower = higher priority)';

