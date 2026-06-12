-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/is_built_in/alterations/alt0000002106
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/is_built_in/column


COMMENT ON COLUMN "constructive_compute_public".platform_secret_definitions.is_built_in IS E'Whether this row was seeded as a built-in secret definition. Built-in rows are immutable.';

