-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/name/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  DROP COLUMN name RESTRICT;


