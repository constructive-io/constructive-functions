-- Deploy: schemas/constructive_objects_public/tables/object/triggers/generate_id_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_private/schema
-- requires: schemas/constructive_objects_public/tables/object/table
-- requires: schemas/constructive_objects_private/trigger_fns/tg_object_generate_id_hash


CREATE TRIGGER generate_id_hash
BEFORE INSERT ON "constructive_objects_public".object
FOR EACH ROW
EXECUTE PROCEDURE "constructive_objects_private".tg_object_generate_id_hash ( );

