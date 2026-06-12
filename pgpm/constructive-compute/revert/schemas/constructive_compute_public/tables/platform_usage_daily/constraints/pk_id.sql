-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/constraints/pk_id


ALTER TABLE "constructive_compute_public".platform_usage_daily
  DROP CONSTRAINT pk_id;
