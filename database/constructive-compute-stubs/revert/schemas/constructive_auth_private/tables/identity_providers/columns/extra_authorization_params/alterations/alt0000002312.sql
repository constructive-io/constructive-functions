-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/extra_authorization_params/alterations/alt0000002312


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN extra_authorization_params DROP DEFAULT;


