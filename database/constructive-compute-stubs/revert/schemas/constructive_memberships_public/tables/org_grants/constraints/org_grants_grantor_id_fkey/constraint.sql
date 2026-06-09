-- Revert: schemas/constructive_memberships_public/tables/org_grants/constraints/org_grants_grantor_id_fkey/constraint


ALTER TABLE "constructive_memberships_public".org_grants 
  DROP CONSTRAINT org_grants_grantor_id_fkey;


