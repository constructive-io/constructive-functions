-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/store_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ADD COLUMN store_id uuid;

