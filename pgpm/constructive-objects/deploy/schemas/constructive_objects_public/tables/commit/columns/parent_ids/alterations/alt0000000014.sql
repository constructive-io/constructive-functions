-- Deploy: schemas/constructive_objects_public/tables/commit/columns/parent_ids/alterations/alt0000000014
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/columns/parent_ids/column


COMMENT ON COLUMN "constructive_objects_public".commit.parent_ids IS E'Parent commit IDs (supports merge commits)';

