-- Revert: schemas/constructive_compute_public/tables/platform_compute_log/columns/database_id/column


ALTER TABLE "constructive_compute_public".platform_compute_log
  DROP COLUMN database_id RESTRICT;
