-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/discovery_url_override/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN discovery_url_override RESTRICT;


