-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/id/alterations/alt0000002611
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/id/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN id SET DEFAULT uuidv7();

