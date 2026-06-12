-- Verify: schemas/constructive_store_public/tables/platform_config/grants/authenticated/delete/grant


SELECT verify_table_grant('constructive_store_public.platform_config', 'DELETE', 'authenticated');


