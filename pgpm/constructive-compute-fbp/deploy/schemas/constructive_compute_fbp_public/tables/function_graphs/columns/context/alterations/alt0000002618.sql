-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/context/alterations/alt0000002618
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/context/column


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN context SET NOT NULL;

