-- Revert: schemas/constructive_auth_private/tables/session_secrets/constraints/session_secrets_pkey/constraint


ALTER TABLE "constructive_auth_private".session_secrets 
  DROP CONSTRAINT session_secrets_pkey;


