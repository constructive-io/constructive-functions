-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/granted/alterations/alt0000000237
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/granted/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN granted SET NOT NULL;

