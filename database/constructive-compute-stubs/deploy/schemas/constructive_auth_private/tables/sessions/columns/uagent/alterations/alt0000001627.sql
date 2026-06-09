-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/uagent/alterations/alt0000001627
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/uagent/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN uagent SET DEFAULT jwt_public.current_user_agent();

