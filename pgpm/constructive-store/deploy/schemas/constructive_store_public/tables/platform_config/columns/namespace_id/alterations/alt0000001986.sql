-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/namespace_id/alterations/alt0000001986
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/columns/namespace_id/column


COMMENT ON COLUMN "constructive_store_public".platform_config.namespace_id IS E'FK to namespaces — logical grouping for config entries';

