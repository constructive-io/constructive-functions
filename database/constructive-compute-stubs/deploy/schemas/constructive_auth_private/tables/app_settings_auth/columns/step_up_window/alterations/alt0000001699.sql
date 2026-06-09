-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/columns/step_up_window/alterations/alt0000001699
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/step_up_window/column


COMMENT ON COLUMN "constructive_auth_private".app_settings_auth.step_up_window IS E'How long a password or MFA re-verification remains valid for step-up authentication';

