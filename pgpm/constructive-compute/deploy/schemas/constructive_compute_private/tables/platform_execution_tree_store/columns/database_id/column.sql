-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/database_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_store/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  ADD COLUMN database_id uuid;

