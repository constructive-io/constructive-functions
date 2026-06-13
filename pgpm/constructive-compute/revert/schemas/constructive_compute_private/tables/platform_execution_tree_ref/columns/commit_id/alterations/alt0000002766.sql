-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/commit_id/alterations/alt0000002766


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ALTER COLUMN commit_id DROP NOT NULL;


