-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/namespace_name/alterations/alt0000001905
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/namespace_name/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespaces.namespace_name IS E'Globally unique computed namespace identifier via inflection.underscore';

