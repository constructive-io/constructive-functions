-- Verify: schemas/constructive_storage_public/tables/platform_files/grants/authenticated/update/grant


-- Column-level grant: verify_table_grant checks role_table_grants which
-- only contains full-table grants. Column grants appear in column_privileges.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.column_privileges
    WHERE table_schema = 'constructive_storage_public'
      AND table_name = 'platform_files'
      AND privilege_type = 'UPDATE'
      AND grantee = 'authenticated'
  ) THEN
    RAISE EXCEPTION 'Missing column-level UPDATE grant on constructive_storage_public.platform_files for authenticated';
  END IF;
END $$;


