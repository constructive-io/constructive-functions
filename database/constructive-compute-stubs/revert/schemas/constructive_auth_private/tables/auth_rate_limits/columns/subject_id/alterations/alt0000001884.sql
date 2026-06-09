-- Revert: schemas/constructive_auth_private/tables/auth_rate_limits/columns/subject_id/alterations/alt0000001884


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  ALTER COLUMN subject_id DROP NOT NULL;


