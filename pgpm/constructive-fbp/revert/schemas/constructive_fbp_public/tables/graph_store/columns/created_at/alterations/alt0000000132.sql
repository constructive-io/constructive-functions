-- Revert: schemas/constructive_fbp_public/tables/graph_store/columns/created_at/alterations/alt0000000132


ALTER TABLE "constructive_fbp_public".graph_store 
  ALTER COLUMN created_at DROP DEFAULT;


