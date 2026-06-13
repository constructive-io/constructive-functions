-- Deploy: schemas/constructive_storage_public/tables/platform_files/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON "constructive_storage_public".platform_files
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

