-- Revert: schemas/constructive_auth_private/tables/session_credentials/columns/ot_token/column


ALTER TABLE "constructive_auth_private".session_credentials 
  DROP COLUMN ot_token RESTRICT;


