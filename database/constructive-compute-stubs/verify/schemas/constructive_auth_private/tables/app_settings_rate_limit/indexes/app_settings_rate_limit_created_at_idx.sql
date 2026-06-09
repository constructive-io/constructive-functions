-- Verify: schemas/constructive_auth_private/tables/app_settings_rate_limit/indexes/app_settings_rate_limit_created_at_idx


SELECT verify_index('constructive_auth_private.app_settings_rate_limit', 'app_settings_rate_limit_created_at_idx');


