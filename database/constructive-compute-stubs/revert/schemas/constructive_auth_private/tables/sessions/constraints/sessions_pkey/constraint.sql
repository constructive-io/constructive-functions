-- Revert: schemas/constructive_auth_private/tables/sessions/constraints/sessions_pkey/constraint


ALTER TABLE "constructive_auth_private".sessions 
  DROP CONSTRAINT sessions_pkey;


