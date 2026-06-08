-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/parent_ids/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  DROP COLUMN parent_ids RESTRICT;


