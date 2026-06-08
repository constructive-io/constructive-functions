-- Revert: schemas/constructive_fbp_public/tables/graph_object/columns/created_at/alterations/alt0000000108


ALTER TABLE "constructive_fbp_public".graph_object 
  ALTER COLUMN created_at DROP DEFAULT;


