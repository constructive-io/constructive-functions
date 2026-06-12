-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/description/alterations/alt0000002103
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/description/column


COMMENT ON COLUMN "constructive_compute_public".platform_secret_definitions.description IS E'Human-readable description of what this secret is used for';

