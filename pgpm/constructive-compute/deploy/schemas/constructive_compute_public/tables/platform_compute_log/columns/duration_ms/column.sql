-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/columns/duration_ms/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table


ALTER TABLE "constructive_compute_public".platform_compute_log 
  ADD COLUMN duration_ms integer;
