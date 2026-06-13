-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/database_id/alterations/alt0000002745


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  ALTER COLUMN database_id DROP NOT NULL;


