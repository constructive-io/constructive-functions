-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/alterations/alt0000002740
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_commit 
  DISABLE ROW LEVEL SECURITY;

