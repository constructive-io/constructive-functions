-- Deploy: schemas/object_store_utils/procedures/array_shift
-- made with <3 @ constructive.io

-- requires: schemas/object_store_utils/schema


CREATE FUNCTION object_store_utils.array_shift( srcarr anyarray )
    RETURNS SETOF anyarray
AS $$
SELECT srcarr[2:array_length(srcarr, 1)]
$$
LANGUAGE sql IMMUTABLE;
