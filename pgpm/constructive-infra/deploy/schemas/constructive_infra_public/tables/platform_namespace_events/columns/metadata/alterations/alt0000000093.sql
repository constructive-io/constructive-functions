-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/metadata/alterations/alt0000000093
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/metadata/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespace_events.metadata IS E'Structured context (old/new values, labels diff, etc.)';

