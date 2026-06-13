-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/parent_ids/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  ADD COLUMN parent_ids uuid[];

