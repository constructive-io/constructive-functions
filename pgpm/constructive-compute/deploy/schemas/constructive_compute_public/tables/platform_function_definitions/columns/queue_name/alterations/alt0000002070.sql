-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/queue_name/alterations/alt0000002070
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/queue_name/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.queue_name IS E'Job queue name for serialization (e.g. email, ai, default)';

