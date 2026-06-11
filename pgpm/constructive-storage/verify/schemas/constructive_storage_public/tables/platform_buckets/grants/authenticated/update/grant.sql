-- Verify: schemas/constructive_storage_public/tables/platform_buckets/grants/authenticated/update/grant


SELECT verify_table_grant('constructive_storage_public.platform_buckets', 'update', 'authenticated');


