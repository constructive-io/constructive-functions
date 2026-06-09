-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/acceptable_client_ids/alterations/alt0000002314


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN acceptable_client_ids DROP NOT NULL;


