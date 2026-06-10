-- Deploy: schemas/constructive_compute_public/tables/platform_function_invocations/columns/id/alterations/alt0000002144
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/columns/id/column


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  ALTER COLUMN id SET DEFAULT uuidv7();

