-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/constraints/platform_buckets_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/id/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  ADD CONSTRAINT platform_buckets_pkey PRIMARY KEY (id);

