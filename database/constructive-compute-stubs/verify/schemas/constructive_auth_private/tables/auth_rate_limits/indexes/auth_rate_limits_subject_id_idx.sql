-- Verify: schemas/constructive_auth_private/tables/auth_rate_limits/indexes/auth_rate_limits_subject_id_idx


SELECT verify_index('constructive_auth_private.auth_rate_limits', 'auth_rate_limits_subject_id_idx');


