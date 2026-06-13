-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  DROP COLUMN id RESTRICT;


