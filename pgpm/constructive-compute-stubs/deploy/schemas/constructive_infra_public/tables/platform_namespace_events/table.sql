-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema


CREATE TABLE "constructive_infra_public".platform_namespace_events (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

