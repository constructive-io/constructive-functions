-- Deploy: schemas/constructive_users_public/tables/users/columns/profile_picture/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_users_public/schema
-- requires: schemas/constructive_users_public/tables/users/table


ALTER TABLE "constructive_users_public".users 
  ADD COLUMN profile_picture image;

