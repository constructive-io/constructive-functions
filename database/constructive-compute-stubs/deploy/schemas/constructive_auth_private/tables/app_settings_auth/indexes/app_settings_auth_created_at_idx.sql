-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/indexes/app_settings_auth_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/created_at/column


CREATE INDEX app_settings_auth_created_at_idx ON "constructive_auth_private".app_settings_auth ( created_at );

