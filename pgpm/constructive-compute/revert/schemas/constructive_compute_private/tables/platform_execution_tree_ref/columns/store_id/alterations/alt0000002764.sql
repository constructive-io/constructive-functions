-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/store_id/alterations/alt0000002764


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ALTER COLUMN store_id DROP NOT NULL;


