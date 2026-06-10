-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/service_url/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ADD COLUMN service_url text;

