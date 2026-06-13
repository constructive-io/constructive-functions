-- Verify: schemas/constructive_store_private/tables/platform_secrets/grants/authenticated/insert/grant


SELECT verify_table_grant('constructive_store_private.platform_secrets', 'INSERT', 'authenticated');


