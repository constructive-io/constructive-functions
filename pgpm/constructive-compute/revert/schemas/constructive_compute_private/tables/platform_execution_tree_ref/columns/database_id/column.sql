-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/database_id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  DROP COLUMN database_id RESTRICT;


