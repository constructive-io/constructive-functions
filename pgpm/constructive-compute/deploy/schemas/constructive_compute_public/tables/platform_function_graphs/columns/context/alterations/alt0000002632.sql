-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/context/alterations/alt0000002632
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/context/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN context SET NOT NULL;

