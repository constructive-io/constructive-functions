-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/name/alterations/alt0000002736
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_store/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/name/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  ALTER COLUMN name SET NOT NULL;

