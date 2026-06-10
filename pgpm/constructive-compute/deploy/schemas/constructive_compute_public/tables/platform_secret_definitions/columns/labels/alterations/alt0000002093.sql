-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/labels/alterations/alt0000002093
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/labels/column


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN labels SET NOT NULL;

