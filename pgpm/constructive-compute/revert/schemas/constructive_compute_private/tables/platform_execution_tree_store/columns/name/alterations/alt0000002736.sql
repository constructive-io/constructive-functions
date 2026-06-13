-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/name/alterations/alt0000002736


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  ALTER COLUMN name DROP NOT NULL;


