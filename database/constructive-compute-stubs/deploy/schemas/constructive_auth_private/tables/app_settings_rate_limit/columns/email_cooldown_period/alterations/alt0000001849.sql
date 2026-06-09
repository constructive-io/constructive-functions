-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/alterations/alt0000001849
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_rate_limit.email_cooldown_period IS E'Minimum time between sending emails to the same address (forgot_password, verification, etc.)';

