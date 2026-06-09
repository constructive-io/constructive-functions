-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/client_secret_id/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN client_secret_id RESTRICT;


