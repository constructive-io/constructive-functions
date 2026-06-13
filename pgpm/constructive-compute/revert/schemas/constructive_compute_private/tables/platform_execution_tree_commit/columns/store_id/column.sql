-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/store_id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  DROP COLUMN store_id RESTRICT;


