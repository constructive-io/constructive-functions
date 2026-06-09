-- Deploy: schemas/constructive_memberships_public/tables/org_admin_grants/columns/grantor_id/alterations/alt0000000746
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/columns/grantor_id/column


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ALTER COLUMN grantor_id SET DEFAULT jwt_public.current_user_id();

