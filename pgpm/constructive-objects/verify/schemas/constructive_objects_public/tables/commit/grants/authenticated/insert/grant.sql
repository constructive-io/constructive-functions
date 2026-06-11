-- Verify: schemas/constructive_objects_public/tables/commit/grants/authenticated/insert/grant


SELECT verify_table_grant('constructive_objects_public.commit', 'insert', 'authenticated');


