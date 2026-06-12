-- Revert: schemas/constructive_compute_public/tables/platform_compute_log/constraints/pk_completed_at_id


ALTER TABLE "constructive_compute_public".platform_compute_log
  DROP CONSTRAINT pk_completed_at_id;
