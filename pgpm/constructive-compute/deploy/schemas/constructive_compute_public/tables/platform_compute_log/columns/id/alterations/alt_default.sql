-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/columns/id/alterations/alt_default
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/columns/id/column


ALTER TABLE "constructive_compute_public".platform_compute_log
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
