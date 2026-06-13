-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/id/alterations/alt0000002742


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  ALTER COLUMN id DROP NOT NULL;


