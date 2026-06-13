-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/database_id/alterations/alt0000000130
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/database_id/column


COMMENT ON COLUMN "constructive_infra_public".platform_secret_definitions.database_id IS E'Database that owns this resource (database-scoped isolation)';

