# @constructive-io/module-loader

Generic scope-aware MetaSchema module resolution for constructive-functions.

Queries `metaschema_modules_public.*_module` tables to resolve schema/table locations dynamically. No hardcoded defaults — throws explicitly if a module is not provisioned.

## Usage

```typescript
import { ModuleLoader } from '@constructive-io/module-loader';

const loader = new ModuleLoader({ pool });

// Resolve function module config for a database
const fnConfig = await loader.function.load(databaseId);
// → { scope, publicSchema, privateSchema, definitionsTable, secretDefinitionsTable }

// With explicit scope (when multiple instances exist)
const orgConfig = await loader.function.load(databaseId, 'org');

// Enumerate all instances
const all = await loader.function.loadAll(databaseId);
```

## Scope Resolution

- `scope` provided → filter by it; throw `ModuleNotProvisionedError` if not found
- `scope` null + 1 instance → return it (unambiguous)
- `scope` null + 0 instances → throw `ModuleNotProvisionedError`
- `scope` null + 2+ instances → throw `AmbiguousScopeError`
