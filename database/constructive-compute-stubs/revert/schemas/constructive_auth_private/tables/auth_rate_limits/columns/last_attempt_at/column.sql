-- Revert: schemas/constructive_auth_private/tables/auth_rate_limits/columns/last_attempt_at/column


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  DROP COLUMN last_attempt_at RESTRICT;


