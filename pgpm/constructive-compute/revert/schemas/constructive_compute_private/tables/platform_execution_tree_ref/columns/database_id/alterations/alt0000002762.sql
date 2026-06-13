-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/database_id/alterations/alt0000002762


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ALTER COLUMN database_id DROP NOT NULL;


