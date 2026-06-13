-- Deploy: schemas/constructive_storage_public/procedures/platform_files_file_path/procedure
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/filename/column


CREATE FUNCTION "constructive_storage_public".platform_files_file_path(
  IN f "constructive_storage_public".platform_files
) RETURNS text AS $_PGFN_$
SELECT f.filename
$_PGFN_$ LANGUAGE sql STABLE;

