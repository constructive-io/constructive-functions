-- Deploy: schemas/constructive_store_public/tables/platform_config/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON "constructive_store_public".platform_config
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

