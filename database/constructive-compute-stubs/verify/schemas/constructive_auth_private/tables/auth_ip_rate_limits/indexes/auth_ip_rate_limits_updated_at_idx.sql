-- Verify: schemas/constructive_auth_private/tables/auth_ip_rate_limits/indexes/auth_ip_rate_limits_updated_at_idx


SELECT verify_index('constructive_auth_private.auth_ip_rate_limits', 'auth_ip_rate_limits_updated_at_idx');


