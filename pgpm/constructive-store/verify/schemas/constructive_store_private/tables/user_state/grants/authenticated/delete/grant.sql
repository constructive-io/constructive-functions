-- Verify: schemas/constructive_store_private/tables/user_state/grants/authenticated/delete/grant


SELECT verify_table_grant('constructive_store_private.user_state', 'delete', 'authenticated');


