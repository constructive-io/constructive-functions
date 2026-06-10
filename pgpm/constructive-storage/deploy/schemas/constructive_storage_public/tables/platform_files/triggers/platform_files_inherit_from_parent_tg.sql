-- Deploy: schemas/constructive_storage_public/tables/platform_files/triggers/platform_files_inherit_from_parent_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema
-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_private/trigger_fns/platform_files_inherit_from_parent


CREATE TRIGGER platform_files_inherit_from_parent_tg
BEFORE INSERT ON "constructive_storage_public".platform_files
FOR EACH ROW
EXECUTE PROCEDURE "constructive_private".platform_files_inherit_from_parent ( );

