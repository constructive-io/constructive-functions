-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/database_id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  DROP COLUMN database_id RESTRICT;


