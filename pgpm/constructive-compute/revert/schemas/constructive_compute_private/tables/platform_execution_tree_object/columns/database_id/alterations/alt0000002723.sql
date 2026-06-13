-- Revert: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/database_id/alterations/alt0000002723


ALTER TABLE "constructive_compute_private".platform_execution_tree_object 
  ALTER COLUMN database_id DROP NOT NULL;


