-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/database_id/alterations/alt0000002734


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  ALTER COLUMN database_id DROP NOT NULL;


