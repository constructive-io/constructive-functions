-- Verify: schemas/constructive_objects_public/tables/store/grants/authenticated/insert/grant


SELECT verify_table_grant('constructive_objects_public.store', 'insert', 'authenticated');


