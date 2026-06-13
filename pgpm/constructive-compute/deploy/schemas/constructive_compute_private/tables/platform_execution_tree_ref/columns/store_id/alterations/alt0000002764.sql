-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/store_id/alterations/alt0000002764
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/store_id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ALTER COLUMN store_id SET NOT NULL;

