-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/created_at/alterations/alt0000002630
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/created_at/column


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN created_at SET NOT NULL;

