-- Verify: schemas/constructive_objects_public/tables/object/grants/authenticated/insert/grant


SELECT verify_table_grant('constructive_objects_public.object', 'INSERT', 'authenticated');


