-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_object/table


ALTER TABLE "constructive_compute_private".platform_execution_tree_object 
  ADD COLUMN id uuid;

