-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/date/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  DROP COLUMN date RESTRICT;


