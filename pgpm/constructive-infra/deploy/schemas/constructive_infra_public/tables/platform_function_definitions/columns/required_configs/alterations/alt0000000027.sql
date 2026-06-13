-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_configs/alterations/alt0000000027
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_configs/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_definitions.required_configs IS E'Embedded config requirements: array of (name, required) tuples';

