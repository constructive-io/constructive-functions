-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/database_id/alterations/alt0000002099
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/database_id/column


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN database_id SET NOT NULL;

