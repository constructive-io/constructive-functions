-- Deploy: schemas/constructive_private/trigger_fns/platform_function_definitions_job_functionprovision_insert
-- made with <3 @ constructive.io

-- requires: schemas/constructive_private/schema


CREATE FUNCTION "constructive_private".platform_function_definitions_job_functionprovision_insert() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;
