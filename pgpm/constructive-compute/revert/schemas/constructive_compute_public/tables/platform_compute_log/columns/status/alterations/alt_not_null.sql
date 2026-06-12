-- Revert: schemas/constructive_compute_public/tables/platform_compute_log/columns/status/alterations/alt_not_null


ALTER TABLE "constructive_compute_public".platform_compute_log
  ALTER COLUMN status DROP NOT NULL;
