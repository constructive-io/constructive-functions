-- Verify: schemas/object_store_utils/procedures/array_utils
-- made with <3 @ constructive.io


SELECT verify_function('object_store_utils.zip_arrays');
SELECT verify_function('object_store_utils.unzip_obj_to_ktree_and_kids');
