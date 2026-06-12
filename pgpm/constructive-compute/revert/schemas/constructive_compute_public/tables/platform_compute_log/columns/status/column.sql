-- Revert: schemas/constructive_compute_public/tables/platform_compute_log/columns/status/column


ALTER TABLE "constructive_compute_public".platform_compute_log
  DROP COLUMN status RESTRICT;
