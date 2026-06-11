-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/context/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/table


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ADD COLUMN context text;

