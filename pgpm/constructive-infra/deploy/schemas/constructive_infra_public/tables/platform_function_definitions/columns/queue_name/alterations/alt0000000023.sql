-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/queue_name/alterations/alt0000000023
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/queue_name/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN queue_name SET DEFAULT 'default';

