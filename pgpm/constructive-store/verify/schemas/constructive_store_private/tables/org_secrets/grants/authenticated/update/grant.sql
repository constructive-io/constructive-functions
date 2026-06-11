-- Verify: schemas/constructive_store_private/tables/org_secrets/grants/authenticated/update/grant


SELECT verify_table_grant('constructive_store_private.org_secrets', 'update', 'authenticated');


