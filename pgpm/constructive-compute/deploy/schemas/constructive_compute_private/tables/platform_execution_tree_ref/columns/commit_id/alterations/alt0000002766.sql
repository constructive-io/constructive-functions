-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/commit_id/alterations/alt0000002766
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/commit_id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ALTER COLUMN commit_id SET NOT NULL;

