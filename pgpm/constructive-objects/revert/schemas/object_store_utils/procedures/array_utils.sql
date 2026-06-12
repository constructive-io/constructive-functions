-- Revert: schemas/object_store_utils/procedures/array_utils
-- made with <3 @ constructive.io


DROP FUNCTION object_store_utils.unzip_obj_to_ktree_and_kids(jsonb);
DROP FUNCTION object_store_utils.zip_arrays(text[], anyarray);
