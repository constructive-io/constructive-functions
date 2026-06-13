-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/policies/auth_sel_pub/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/policies/enable_row_level_security


CREATE POLICY auth_sel_pub ON "constructive_storage_public".platform_buckets
FOR SELECT
TO authenticated
USING (
  is_public = true
);

