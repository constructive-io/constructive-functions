-- Verify: schemas/constructive_store_private/tables/user_secrets/indexes/user_secrets_updated_at_idx


SELECT verify_index('constructive_store_private.user_secrets', 'user_secrets_updated_at_idx');


