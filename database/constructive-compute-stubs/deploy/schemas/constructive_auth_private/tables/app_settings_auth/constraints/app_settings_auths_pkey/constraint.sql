-- Deploy: schemas/constructive_auth_private/tables/app_settings_auth/constraints/app_settings_auths_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/table
-- requires: schemas/constructive_auth_private/tables/app_settings_auth/columns/id/column


ALTER TABLE "constructive_auth_private".app_settings_auth 
  ADD CONSTRAINT app_settings_auths_pkey PRIMARY KEY (id);

