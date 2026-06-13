-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/queue_name/alterations/alt0000000024
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/queue_name/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_definitions.queue_name IS E'Job queue name for serialization (e.g. email, ai, default)';

