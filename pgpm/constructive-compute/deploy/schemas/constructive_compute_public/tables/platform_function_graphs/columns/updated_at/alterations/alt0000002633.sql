-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/updated_at/alterations/alt0000002633
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/updated_at/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN updated_at SET NOT NULL;

