-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/constraints/platform_function_definitions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/id/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_pkey PRIMARY KEY (id);

