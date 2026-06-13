-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/id/alterations/alt0000002731


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  ALTER COLUMN id DROP NOT NULL;


