-- Deploy: schemas/constructive_auth_private/tables/app_settings_rate_limit/indexes/app_settings_rate_limit_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/constructive_auth_private/tables/app_settings_rate_limit/columns/created_at/column


CREATE INDEX app_settings_rate_limit_created_at_idx ON "constructive_auth_private".app_settings_rate_limit ( created_at );

