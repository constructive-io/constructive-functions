-- Verify: schemas/constructive_store_private/tables/user_secrets/grants/authenticated/update/grant


SELECT verify_table_grant('constructive_store_private.user_secrets', 'UPDATE', 'authenticated');


