-- Deploy: schemas/constructive_store_private/tables/platform_secrets/constraints/platform_secrets_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/id/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ADD CONSTRAINT platform_secrets_pkey PRIMARY KEY (id);

