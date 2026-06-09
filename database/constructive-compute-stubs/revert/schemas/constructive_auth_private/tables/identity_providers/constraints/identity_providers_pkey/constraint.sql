-- Revert: schemas/constructive_auth_private/tables/identity_providers/constraints/identity_providers_pkey/constraint


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP CONSTRAINT identity_providers_pkey;


