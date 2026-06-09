-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/acceptable_client_ids/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN acceptable_client_ids RESTRICT;


