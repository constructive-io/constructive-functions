-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/alterations/alt0000001919
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table


COMMENT ON TABLE "constructive_infra_public".platform_namespace_events IS E'Namespace lifecycle events — audit log of creation, activation, deactivation, label changes';

