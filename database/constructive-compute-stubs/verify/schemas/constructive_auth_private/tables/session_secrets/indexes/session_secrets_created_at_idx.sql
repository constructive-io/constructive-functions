-- Verify: schemas/constructive_auth_private/tables/session_secrets/indexes/session_secrets_created_at_idx


SELECT verify_index('constructive_auth_private.session_secrets', 'session_secrets_created_at_idx');


