-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/tree_id/alterations/alt0000002749
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/tree_id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  ALTER COLUMN tree_id SET NOT NULL;

