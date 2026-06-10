-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/triggers/generate_id_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_private/schema
-- requires: schemas/constructive_platform_function_graph_private/trigger_fns/tg_object_generate_id_hash
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/table


CREATE TRIGGER generate_id_hash
BEFORE INSERT ON "constructive_platform_function_graph_public".platform_function_graph_object
FOR EACH ROW
EXECUTE PROCEDURE "constructive_platform_function_graph_private".tg_object_generate_id_hash ( );

