-- Verify: schemas/constructive_store_private/tables/platform_secrets/grants/authenticated/update/grant


SELECT verify_table_grant('constructive_store_private.platform_secrets', 'UPDATE', 'authenticated');


