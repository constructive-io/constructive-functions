-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/ktree/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_object 
  DROP COLUMN ktree RESTRICT;


