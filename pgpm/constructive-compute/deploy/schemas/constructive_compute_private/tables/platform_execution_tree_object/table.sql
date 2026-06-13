-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_object/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE TABLE "constructive_compute_private".platform_execution_tree_object (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

