-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/id/alterations/alt0000002760
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_ref 
  ALTER COLUMN id SET DEFAULT uuidv7();

