-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_session_duration/alterations/alt0000001675
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/default_session_duration/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.default_session_duration IS E'How long sessions last for standard (non-remember-me) logins';

