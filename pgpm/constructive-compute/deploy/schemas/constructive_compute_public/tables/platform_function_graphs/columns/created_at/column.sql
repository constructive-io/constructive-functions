-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ADD COLUMN created_at timestamptz;

