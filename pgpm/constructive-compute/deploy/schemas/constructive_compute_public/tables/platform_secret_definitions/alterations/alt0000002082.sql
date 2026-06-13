-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/alterations/alt0000002082
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/table


COMMENT ON TABLE "constructive_compute_public".platform_secret_definitions IS E'Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets.';

