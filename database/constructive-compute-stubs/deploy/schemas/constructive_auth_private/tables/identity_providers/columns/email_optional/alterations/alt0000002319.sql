-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/email_optional/alterations/alt0000002319
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/email_optional/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.email_optional IS E'When true, sign-in succeeds even if the IdP does not return a verified email. The user is provisioned without an email and can add one later. When false, missing email is a hard error.';

