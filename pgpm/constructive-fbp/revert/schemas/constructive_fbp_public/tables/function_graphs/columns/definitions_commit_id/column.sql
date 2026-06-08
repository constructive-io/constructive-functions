-- Revert: schemas/constructive_fbp_public/tables/function_graphs/columns/definitions_commit_id/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  DROP COLUMN definitions_commit_id RESTRICT;


