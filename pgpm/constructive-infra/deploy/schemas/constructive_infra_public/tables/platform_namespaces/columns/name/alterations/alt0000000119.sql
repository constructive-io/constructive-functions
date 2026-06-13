-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/name/alterations/alt0000000119
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/name/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespaces.name IS E'Human-readable namespace name (e.g. default, production, oauth)';

