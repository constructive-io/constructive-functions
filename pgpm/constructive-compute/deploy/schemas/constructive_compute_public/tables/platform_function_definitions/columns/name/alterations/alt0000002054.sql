-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/name/alterations/alt0000002054
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/name/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.name IS E'Function name within scope (e.g. send_verification_link, process_file_embedding)';

