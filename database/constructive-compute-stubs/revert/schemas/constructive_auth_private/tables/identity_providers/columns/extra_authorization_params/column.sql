-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/extra_authorization_params/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN extra_authorization_params RESTRICT;


