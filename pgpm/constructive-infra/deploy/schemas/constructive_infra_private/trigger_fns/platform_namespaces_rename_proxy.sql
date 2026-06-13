-- Deploy: schemas/constructive_infra_private/trigger_fns/platform_namespaces_rename_proxy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_private/schema


CREATE FUNCTION "constructive_infra_private".platform_namespaces_rename_proxy() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  SELECT inflection.underscore(ARRAY['constructive', NEW.name]) INTO NEW.namespace_name;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

