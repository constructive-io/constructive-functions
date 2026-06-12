-- Deploy: schemas/object_store_utils/procedures/array_get_last
-- made with <3 @ constructive.io

-- requires: schemas/object_store_utils/schema


CREATE FUNCTION object_store_utils.array_get_last(
  arr anyarray
) returns anyelement as $$
  SELECT arr[array_length(arr, 1)];
$$
LANGUAGE 'sql' IMMUTABLE;
