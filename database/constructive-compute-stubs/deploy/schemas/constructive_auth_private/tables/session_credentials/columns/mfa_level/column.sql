-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/mfa_level/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table


ALTER TABLE "constructive_auth_private".session_credentials 
  ADD COLUMN mfa_level text;

