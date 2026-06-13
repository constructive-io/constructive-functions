-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/store_id/alterations/alt0000002747


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  ALTER COLUMN store_id DROP NOT NULL;


