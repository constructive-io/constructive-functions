-- Verify: schemas/constructive_storage_public/tables/platform_files/grants/authenticated/update/grant


SELECT verify_table_grant('constructive_storage_public.platform_files', 'update', 'authenticated');


