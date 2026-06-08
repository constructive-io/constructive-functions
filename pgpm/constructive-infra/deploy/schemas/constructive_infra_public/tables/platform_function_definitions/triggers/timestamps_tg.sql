-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON "constructive_infra_public".platform_function_definitions
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

