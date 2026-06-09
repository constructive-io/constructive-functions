-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/access_level/alterations/alt0000001661


ALTER TABLE "constructive_auth_private".session_credentials 
  ALTER COLUMN access_level DROP NOT NULL;


