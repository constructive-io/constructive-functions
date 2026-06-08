-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/is_active/alterations/alt0000000114
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/is_active/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespaces.is_active IS E'Whether this namespace is active (soft-disable for filtering)';

