-- Revert: schemas/constructive_storage_public/tables/platform_files/grants/authenticated/update/grant


REVOKE UPDATE (filename, description, tags) ON "constructive_storage_public".platform_files FROM authenticated;


