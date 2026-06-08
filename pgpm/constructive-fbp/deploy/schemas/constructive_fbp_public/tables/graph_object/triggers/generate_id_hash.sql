-- Deploy: schemas/constructive_fbp_public/tables/graph_object/triggers/generate_id_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/table
-- requires: schemas/constructive_fbp_private/trigger_fns/tg_graph_object_generate_id_hash


CREATE TRIGGER generate_id_hash
BEFORE INSERT ON "constructive_fbp_public".graph_object
FOR EACH ROW
EXECUTE PROCEDURE "constructive_fbp_private".tg_graph_object_generate_id_hash ( );

