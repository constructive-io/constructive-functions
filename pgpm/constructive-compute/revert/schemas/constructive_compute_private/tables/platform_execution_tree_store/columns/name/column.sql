-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/name/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  DROP COLUMN name RESTRICT;


