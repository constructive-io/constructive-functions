-- Deploy: schemas/constructive_compute_public/tables/platform_secret_definitions/alterations/alt0000002081
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_secret_definitions/table


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  DISABLE ROW LEVEL SECURITY;

