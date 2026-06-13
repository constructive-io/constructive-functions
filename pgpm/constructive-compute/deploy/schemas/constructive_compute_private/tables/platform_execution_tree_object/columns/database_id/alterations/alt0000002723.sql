-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/database_id/alterations/alt0000002723
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_object/table
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/database_id/column


ALTER TABLE "constructive_compute_private".platform_execution_tree_object 
  ALTER COLUMN database_id SET NOT NULL;

