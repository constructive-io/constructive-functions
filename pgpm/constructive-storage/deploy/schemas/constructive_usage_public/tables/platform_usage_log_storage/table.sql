-- Deploy: schemas/constructive_usage_public/tables/platform_usage_log_storage/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_usage_public/schema

CREATE TABLE "constructive_usage_public".platform_usage_log_storage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
