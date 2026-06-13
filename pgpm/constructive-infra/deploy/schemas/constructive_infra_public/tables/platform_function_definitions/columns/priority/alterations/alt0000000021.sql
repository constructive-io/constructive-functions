-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/priority/alterations/alt0000000021
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/priority/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_definitions.priority IS E'Job priority (lower = higher priority)';

