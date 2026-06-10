-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/namespace_id/alterations/alt0000002057
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/namespace_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.namespace_id IS E'Namespace this function belongs to (FK to namespaces table)';

