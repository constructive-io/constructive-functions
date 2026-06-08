-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/columns/secret_name/alterations/alt0000000148
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/secret_name/column
-- requires: schemas/constructive_infra_public/schema


COMMENT ON COLUMN "constructive_infra_public".platform_secret_values.secret_name IS 'References the secret name from platform_secret_definitions.';
