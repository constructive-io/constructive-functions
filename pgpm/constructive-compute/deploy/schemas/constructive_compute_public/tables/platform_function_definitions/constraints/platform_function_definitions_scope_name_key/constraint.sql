-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/constraints/platform_function_definitions_scope_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/scope/column
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/name/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_scope_name_key 
    UNIQUE (scope, name);

