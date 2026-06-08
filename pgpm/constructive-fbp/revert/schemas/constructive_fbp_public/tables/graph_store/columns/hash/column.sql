-- Revert: schemas/constructive_fbp_public/tables/graph_store/columns/hash/column


ALTER TABLE "constructive_fbp_public".graph_store 
  DROP COLUMN hash RESTRICT;


