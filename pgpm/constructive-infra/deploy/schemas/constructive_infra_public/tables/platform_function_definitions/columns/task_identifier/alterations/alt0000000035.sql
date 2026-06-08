-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/task_identifier/alterations/alt0000000035
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/task_identifier/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_definitions.task_identifier IS E'Computed routing slug: scope:name (used by Knative job worker for dispatch)';

