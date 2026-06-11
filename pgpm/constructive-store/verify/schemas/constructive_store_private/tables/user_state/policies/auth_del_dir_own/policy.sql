-- Verify: schemas/constructive_store_private/tables/user_state/policies/auth_del_dir_own/policy


SELECT verify_policy('auth_del_dir_own', 'constructive_store_private.user_state');


