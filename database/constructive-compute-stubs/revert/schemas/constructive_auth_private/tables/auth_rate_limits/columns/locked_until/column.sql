-- Revert: schemas/constructive_auth_private/tables/auth_rate_limits/columns/locked_until/column


ALTER TABLE "constructive_auth_private".auth_rate_limits 
  DROP COLUMN locked_until RESTRICT;


