-- Verify: schemas/constructive_storage_public/tables/platform_buckets/policies/auth_del_own/policy


SELECT verify_policy('auth_del_own', 'constructive_storage_public.platform_buckets');


