-- Deploy: schemas/constructive_storage_public/tables/platform_files/triggers/platform_files_gc_storage_object_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_private/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_private/trigger_fns/platform_files_gc_storage_object


CREATE TRIGGER platform_files_gc_storage_object_tg
AFTER DELETE ON "constructive_storage_public".platform_files
FOR EACH ROW
EXECUTE PROCEDURE "constructive_storage_private".platform_files_gc_storage_object ( );

