-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/kind/alterations/alt0000001647
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/kind/column


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN kind SET DEFAULT 'bearer';

