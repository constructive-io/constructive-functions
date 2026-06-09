-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/database_id/alterations/alt0000001917
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/database_id/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespaces.database_id IS E'Database that owns this resource (database-scoped isolation)';

