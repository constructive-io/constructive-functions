-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/database_id/alterations/alt0000002762
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/database_id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ALTER COLUMN database_id SET NOT NULL;

