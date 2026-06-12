-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/store_id/alterations/alt0000002629
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/store_id/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN store_id SET NOT NULL;

