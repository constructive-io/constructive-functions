-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/session_idle_timeout/alterations/alt0000001798
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/session_idle_timeout/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.session_idle_timeout IS E'Optional idle timeout: sessions unused for this duration are expired; NULL means no idle expiry';

