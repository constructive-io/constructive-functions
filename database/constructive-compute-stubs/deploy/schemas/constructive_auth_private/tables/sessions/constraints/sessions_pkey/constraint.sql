-- Deploy: schemas/constructive_auth_private/tables/sessions/constraints/sessions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/id/column


ALTER TABLE "constructive_auth_private".sessions 
  ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);

