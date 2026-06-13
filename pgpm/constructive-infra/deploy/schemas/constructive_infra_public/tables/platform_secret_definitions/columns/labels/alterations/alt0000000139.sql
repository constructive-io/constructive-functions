-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/labels/alterations/alt0000000139
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/labels/column


COMMENT ON COLUMN "constructive_infra_public".platform_secret_definitions.labels IS E'Key-value metadata for filtering and grouping secret definitions';

