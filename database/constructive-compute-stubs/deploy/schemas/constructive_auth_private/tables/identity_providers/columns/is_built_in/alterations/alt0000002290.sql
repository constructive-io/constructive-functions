-- Deploy: schemas/constructive_auth_private/tables/identity_providers/columns/is_built_in/alterations/alt0000002290
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/identity_providers/columns/is_built_in/column


COMMENT ON COLUMN "constructive_auth_private".identity_providers.is_built_in IS E'Whether this row was seeded as a built-in provider (google / github / apple / facebook / microsoft). Built-in rows are immutable except for client_id / client_secret_id / enabled. Custom-provider rows have is_built_in = false and do not count against the provider quota only when is_built_in = true.';

