-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/enabled/alterations/alt0000002297
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/enabled/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.enabled IS E'Whether sign-in via this provider is currently allowed. Toggled by enable_identity_provider / disable_identity_provider admin procedures. Disabled providers remain in the public-safe view as enabled=false so client UIs can grey out the button.';

