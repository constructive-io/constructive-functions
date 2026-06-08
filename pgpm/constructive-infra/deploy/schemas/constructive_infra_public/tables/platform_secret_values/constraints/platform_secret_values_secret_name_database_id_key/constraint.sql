-- Deploy: schemas/constructive_infra_public/tables/platform_secret_values/constraints/platform_secret_values_secret_name_database_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/secret_name/column
-- requires: schemas/constructive_infra_public/tables/platform_secret_values/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  ADD CONSTRAINT platform_secret_values_secret_name_database_id_key
    UNIQUE (secret_name, database_id);
