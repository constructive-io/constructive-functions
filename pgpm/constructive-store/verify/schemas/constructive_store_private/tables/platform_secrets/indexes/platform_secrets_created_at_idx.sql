-- Verify: schemas/constructive_store_private/tables/platform_secrets/indexes/platform_secrets_created_at_idx


SELECT verify_index('constructive_store_private.platform_secrets', 'platform_secrets_created_at_idx');


