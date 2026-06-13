-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/date/alterations/alt0000002753


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  ALTER COLUMN date DROP NOT NULL;


