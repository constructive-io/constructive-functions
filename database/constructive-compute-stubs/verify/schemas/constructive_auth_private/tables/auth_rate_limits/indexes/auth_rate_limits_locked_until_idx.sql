-- Verify: schemas/constructive_auth_private/tables/auth_rate_limits/indexes/auth_rate_limits_locked_until_idx


SELECT verify_index('constructive_auth_private.auth_rate_limits', 'auth_rate_limits_locked_until_idx');


