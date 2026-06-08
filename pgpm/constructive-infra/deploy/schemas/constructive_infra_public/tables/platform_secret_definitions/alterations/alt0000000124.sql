-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/alterations/alt0000000124
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table


COMMENT ON TABLE "constructive_infra_public".platform_secret_definitions IS E'Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets.';

