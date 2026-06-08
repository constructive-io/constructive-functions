-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/description/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN description RESTRICT;


