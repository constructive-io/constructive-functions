-- Deploy: schemas/constructive_storage_public/procedures/platform_files_rename/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/filename/column
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/id/column


CREATE FUNCTION "constructive_storage_public".platform_files_rename(
  IN p_file_id pg_catalog.uuid,
  IN p_new_filename pg_catalog.text
) RETURNS "constructive_storage_public".platform_files AS $_PGFN_$
UPDATE "constructive_storage_public".platform_files SET
filename = p_new_filename
WHERE
  id = p_file_id
RETURNING *
$_PGFN_$ LANGUAGE sql VOLATILE;

