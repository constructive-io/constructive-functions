-- Deploy: schemas/constructive_auth_private/tables/session_secrets/columns/session_id/alterations/alt0000001817
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/session_secrets/table
-- requires: schemas/constructive_auth_private/tables/session_secrets/columns/session_id/column


ALTER TABLE "constructive_auth_private".session_secrets 
  ALTER COLUMN session_id SET DEFAULT jwt_public.current_user_id();

