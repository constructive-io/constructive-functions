-- Verify: schemas/constructive_store_public/tables/platform_config/grants/authenticated/select/grant


SELECT verify_table_grant('constructive_store_public.platform_config', 'SELECT', 'authenticated');


