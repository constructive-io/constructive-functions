-- Verify: schemas/constructive_auth_private/tables/auth_rate_limits/indexes/auth_rate_limits_created_at_idx


SELECT verify_index('constructive_auth_private.auth_rate_limits', 'auth_rate_limits_created_at_idx');


