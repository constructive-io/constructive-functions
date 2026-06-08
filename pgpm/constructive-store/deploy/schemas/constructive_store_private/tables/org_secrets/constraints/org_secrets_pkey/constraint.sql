-- Deploy: schemas/constructive_store_private/tables/org_secrets/constraints/org_secrets_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/id/column


ALTER TABLE "constructive_store_private".org_secrets 
  ADD CONSTRAINT org_secrets_pkey PRIMARY KEY (id);

