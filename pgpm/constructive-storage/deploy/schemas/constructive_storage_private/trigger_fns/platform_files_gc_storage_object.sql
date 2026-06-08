-- Deploy: schemas/constructive_storage_private/trigger_fns/platform_files_gc_storage_object
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_private/schema


CREATE FUNCTION "constructive_storage_private".platform_files_gc_storage_object() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  PERFORM app_jobs.add_job(identifier:='delete_s3_object', payload:=json_build_object('table', 'platform_files', 'schema', 'constructive-storage-public', 'bucket_id', OLD.bucket_id, 'key', OLD.key), queue_name:='storage_gc', run_at:=now() + '5 seconds'::interval, max_attempts:=5, priority:=100);
  RETURN OLD;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

