-- Verify: schemas/constructive_store_private/tables/user_state/grants/authenticated/insert/grant


SELECT verify_table_grant('constructive_store_private.user_state', 'insert', 'authenticated');


