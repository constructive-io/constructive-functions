-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/indexes/platform_function_definitions_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/created_at/column


CREATE INDEX platform_function_definitions_created_at_idx ON "constructive_infra_public".platform_function_definitions ( created_at );

