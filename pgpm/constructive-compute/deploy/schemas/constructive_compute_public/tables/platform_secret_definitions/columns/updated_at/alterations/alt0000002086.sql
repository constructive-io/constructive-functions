-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/updated_at/alterations/alt0000002086
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/updated_at/column


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN updated_at SET DEFAULT now();

