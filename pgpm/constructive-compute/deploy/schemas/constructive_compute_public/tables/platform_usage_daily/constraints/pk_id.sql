-- Deploy: schemas/constructive_compute_public/tables/platform_usage_daily/constraints/pk_id
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/table

ALTER TABLE "constructive_compute_public".platform_usage_daily
  ADD CONSTRAINT platform_usage_daily_pkey PRIMARY KEY (id);
