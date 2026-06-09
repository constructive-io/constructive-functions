-- Revert: schemas/constructive_auth_private/tables/sessions/columns/id/alterations/alt0000001613


ALTER TABLE "constructive_auth_private".sessions 
  ALTER COLUMN id DROP NOT NULL;


