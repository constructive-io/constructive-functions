-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/required_secrets/alterations/alt0000002076
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/required_secrets/column
-- requires: schemas/constructive_compute_public/types/function_requirement/type


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN required_secrets SET DEFAULT ARRAY[]::"constructive_compute_public".function_requirement[];

