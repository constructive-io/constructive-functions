-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema

CREATE TABLE "constructive_compute_public".platform_compute_log (
  completed_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (completed_at);
