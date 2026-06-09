-- Revert: schemas/constructive_auth_private/tables/session_credentials/constraints/session_credentials_pkey/constraint


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP CONSTRAINT session_credentials_pkey;


