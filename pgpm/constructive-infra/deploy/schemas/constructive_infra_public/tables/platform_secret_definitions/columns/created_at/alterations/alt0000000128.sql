-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/created_at/alterations/alt0000000128
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/created_at/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN created_at SET DEFAULT now();

