-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/triggers/platform_function_definitions_job_functionprovision_insert_tg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema
-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_private/trigger_fns/platform_function_definitions_job_functionprovision_insert


CREATE TRIGGER platform_function_definitions_job_functionprovision_insert_tg
AFTER INSERT ON "constructive_compute_public".platform_function_definitions
FOR EACH ROW
EXECUTE PROCEDURE "constructive_private".platform_function_definitions_job_functionprovision_insert ( );

