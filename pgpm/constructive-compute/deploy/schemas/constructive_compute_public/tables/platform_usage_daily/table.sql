-- Deploy: schemas/constructive_compute_public/tables/platform_usage_daily/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema

CREATE TABLE "constructive_compute_public".platform_usage_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid()
);
