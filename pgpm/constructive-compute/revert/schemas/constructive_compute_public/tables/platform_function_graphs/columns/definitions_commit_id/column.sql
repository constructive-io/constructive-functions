-- Revert: schemas/constructive_compute_public/tables/platform_function_graphs/columns/definitions_commit_id/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  DROP COLUMN definitions_commit_id RESTRICT;


