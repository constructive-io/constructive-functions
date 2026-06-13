-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/description/alterations/alt0000001906
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/description/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespaces.description IS E'Optional human-readable description of this namespace';

