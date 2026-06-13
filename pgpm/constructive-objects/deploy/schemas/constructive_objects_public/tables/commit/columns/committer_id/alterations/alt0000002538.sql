-- Deploy: schemas/constructive_objects_public/tables/commit/columns/committer_id/alterations/alt0000002538
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/columns/committer_id/column


COMMENT ON COLUMN "constructive_objects_public".commit.committer_id IS E'User who committed (may differ from author)';

