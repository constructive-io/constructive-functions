-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/client_secret_id/alterations/alt0000002307
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/client_secret_id/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.client_secret_id IS E'Pointer to the row in user_secrets that holds the OAuth2 client_secret (encrypted at rest). NULL only briefly between create_identity_provider and the first rotate_provider_secret. Rotation writes a new user_secrets row and atomically updates this column; the raw secret is never returned to clients.';

