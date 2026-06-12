-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/entity_type/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  DROP COLUMN entity_type RESTRICT;
