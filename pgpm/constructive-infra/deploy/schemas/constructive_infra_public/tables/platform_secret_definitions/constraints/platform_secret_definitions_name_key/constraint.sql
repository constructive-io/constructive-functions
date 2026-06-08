-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/constraints/platform_secret_definitions_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ADD CONSTRAINT platform_secret_definitions_name_key 
    UNIQUE (name);

