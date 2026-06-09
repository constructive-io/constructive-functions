-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/access_level/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN access_level RESTRICT;


