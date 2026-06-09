-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/auth_method/alterations/alt0000001637
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/columns/auth_method/column


COMMENT ON COLUMN "constructive_auth_private".sessions.auth_method IS E'Authentication method used to create this session: password, identity, magic_link, email_otp, sms_otp, anonymous';

