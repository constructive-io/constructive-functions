-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table


GRANT SELECT ON "constructive_store_public".platform_config_definitions TO authenticated;

