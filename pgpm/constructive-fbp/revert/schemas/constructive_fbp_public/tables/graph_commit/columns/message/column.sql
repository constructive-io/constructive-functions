-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/message/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  DROP COLUMN message RESTRICT;


