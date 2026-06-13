-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/id/alterations/alt0000002759


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ALTER COLUMN id DROP NOT NULL;


