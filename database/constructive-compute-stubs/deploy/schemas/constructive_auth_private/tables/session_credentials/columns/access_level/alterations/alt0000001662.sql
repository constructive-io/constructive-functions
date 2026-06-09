-- Deploy: schemas/constructive_auth_private/tables/session_credentials/columns/access_level/alterations/alt0000001662
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_credentials/table
-- requires: schemas/constructive_auth_private/tables/session_credentials/columns/access_level/column


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN access_level SET DEFAULT 'full_access';

