-- Deploy: schemas/constructive_auth_private/tables/sessions/columns/ip/alterations/alt0000001625
-- made with <3 @ constructive.io

-- requires: schemas/constructive_auth_private/schema
-- requires: schemas/constructive_auth_private/tables/sessions/table
-- requires: schemas/constructive_auth_private/tables/sessions/columns/ip/column


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN ip SET DEFAULT jwt_public.current_ip_address();

