-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/description/alterations/alt0000000131
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/description/column


COMMENT ON COLUMN "constructive_infra_public".platform_secret_definitions.description IS E'Human-readable description of what this secret is used for';

