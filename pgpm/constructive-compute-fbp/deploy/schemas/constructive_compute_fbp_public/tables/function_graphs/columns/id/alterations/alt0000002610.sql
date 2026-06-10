-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/id/alterations/alt0000002610
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/id/column


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN id SET NOT NULL;

