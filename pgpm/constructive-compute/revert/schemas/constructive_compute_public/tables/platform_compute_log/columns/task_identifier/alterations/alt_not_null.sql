-- Revert: schemas/constructive_compute_public/tables/platform_compute_log/columns/task_identifier/alterations/alt_not_null


ALTER TABLE "constructive_compute_public".platform_compute_log
  ALTER COLUMN task_identifier DROP NOT NULL;
