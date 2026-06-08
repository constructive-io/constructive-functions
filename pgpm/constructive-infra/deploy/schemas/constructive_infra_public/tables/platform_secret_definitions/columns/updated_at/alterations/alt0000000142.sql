-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/updated_at/alterations/alt0000000142
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/updated_at/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN updated_at SET DEFAULT now();

