-- Verify: schemas/constructive_auth_private/tables/identity_providers/indexes/identity_providers_updated_at_idx


SELECT verify_index('constructive_auth_private.identity_providers', 'identity_providers_updated_at_idx');


