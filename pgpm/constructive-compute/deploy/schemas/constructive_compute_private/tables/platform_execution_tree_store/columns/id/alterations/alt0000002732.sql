-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/id/alterations/alt0000002732
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_store/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_store 
  ALTER COLUMN id SET DEFAULT uuidv7();

