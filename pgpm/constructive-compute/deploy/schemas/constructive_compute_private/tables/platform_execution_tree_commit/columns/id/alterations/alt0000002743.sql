-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/id/alterations/alt0000002743
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  ALTER COLUMN id SET DEFAULT uuidv7();

