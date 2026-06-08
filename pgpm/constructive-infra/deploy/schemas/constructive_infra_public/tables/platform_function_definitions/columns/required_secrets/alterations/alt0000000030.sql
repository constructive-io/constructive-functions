-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_secrets/alterations/alt0000000030
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_secrets/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_definitions.required_secrets IS E'Embedded secret requirements: array of (name, required) tuples';

