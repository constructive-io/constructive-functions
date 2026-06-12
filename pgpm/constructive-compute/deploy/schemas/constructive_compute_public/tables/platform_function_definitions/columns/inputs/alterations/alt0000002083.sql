-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/inputs/alterations/alt0000002083
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/inputs/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.inputs IS E'Input port definitions: [{name, type, description?, optional?, multi?, schema?}]';

