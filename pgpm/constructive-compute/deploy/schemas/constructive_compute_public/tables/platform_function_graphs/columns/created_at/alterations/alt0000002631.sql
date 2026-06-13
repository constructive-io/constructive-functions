-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/created_at/alterations/alt0000002631
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/created_at/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

