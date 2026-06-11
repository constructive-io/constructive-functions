-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table


GRANT SELECT ON "constructive_storage_public".platform_buckets TO authenticated;

