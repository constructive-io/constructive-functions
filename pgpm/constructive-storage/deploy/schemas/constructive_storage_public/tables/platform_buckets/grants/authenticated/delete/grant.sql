-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table


GRANT DELETE ON "constructive_storage_public".platform_buckets TO authenticated;

