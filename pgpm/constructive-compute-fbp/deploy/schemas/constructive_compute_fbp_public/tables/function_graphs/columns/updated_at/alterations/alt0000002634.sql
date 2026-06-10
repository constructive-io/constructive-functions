-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/updated_at/alterations/alt0000002634
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/updated_at/column


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

