-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/constraints/pk_completed_at_id
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/columns/id/column
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/columns/id/alterations/alt_not_null

ALTER TABLE "constructive_compute_public".platform_compute_log
  ADD CONSTRAINT platform_compute_log_pkey PRIMARY KEY (completed_at, id);
