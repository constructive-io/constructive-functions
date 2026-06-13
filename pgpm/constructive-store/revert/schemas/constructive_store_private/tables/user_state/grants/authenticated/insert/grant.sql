-- Revert: schemas/constructive_store_private/tables/user_state/grants/authenticated/insert/grant


REVOKE INSERT ON "constructive_store_private".user_state FROM authenticated;


