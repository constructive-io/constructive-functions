-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/name/alterations/alt0000002102
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/name/column


COMMENT ON COLUMN "constructive_compute_public".platform_secret_definitions.name IS E'Secret name (must match app_secrets.name for resolution)';

