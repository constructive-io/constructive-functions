-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/name/alterations/alt0000000141
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/name/column


COMMENT ON COLUMN "constructive_infra_public".platform_secret_definitions.name IS E'Secret name (must match app_secrets.name for resolution)';

