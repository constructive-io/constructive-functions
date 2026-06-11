# platformNamespaceEvent

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformNamespaceEvent records via constructive-functions CLI (api target)

## Usage

```bash
constructive-functions api:platform-namespace-event list
constructive-functions api:platform-namespace-event list --where.<field>.<op> <value> --orderBy <values>
constructive-functions api:platform-namespace-event list --limit 10 --after <cursor>
constructive-functions api:platform-namespace-event find-first --where.<field>.<op> <value>
constructive-functions api:platform-namespace-event get --id <UUID>
constructive-functions api:platform-namespace-event create --databaseId <UUID> --eventType <String> --namespaceId <UUID> [--actorId <UUID>] [--cpuMillicores <Int>] [--memoryBytes <BigInt>] [--message <String>] [--metadata <JSON>] [--metrics <JSON>] [--networkEgressBytes <BigInt>] [--networkIngressBytes <BigInt>] [--podCount <Int>] [--storageBytes <BigInt>]
constructive-functions api:platform-namespace-event update --id <UUID> [--actorId <UUID>] [--cpuMillicores <Int>] [--databaseId <UUID>] [--eventType <String>] [--memoryBytes <BigInt>] [--message <String>] [--metadata <JSON>] [--metrics <JSON>] [--namespaceId <UUID>] [--networkEgressBytes <BigInt>] [--networkIngressBytes <BigInt>] [--podCount <Int>] [--storageBytes <BigInt>]
constructive-functions api:platform-namespace-event delete --id <UUID>
```

## Examples

### List platformNamespaceEvent records

```bash
constructive-functions api:platform-namespace-event list
```

### List platformNamespaceEvent records with pagination

```bash
constructive-functions api:platform-namespace-event list --limit 10 --offset 0
```

### List platformNamespaceEvent records with cursor pagination

```bash
constructive-functions api:platform-namespace-event list --limit 10 --after <cursor>
```

### Find first matching platformNamespaceEvent

```bash
constructive-functions api:platform-namespace-event find-first --where.id.equalTo <value>
```

### List platformNamespaceEvent records with filtering and ordering

```bash
constructive-functions api:platform-namespace-event list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformNamespaceEvent

```bash
constructive-functions api:platform-namespace-event create --databaseId <UUID> --eventType <String> --namespaceId <UUID> [--actorId <UUID>] [--cpuMillicores <Int>] [--memoryBytes <BigInt>] [--message <String>] [--metadata <JSON>] [--metrics <JSON>] [--networkEgressBytes <BigInt>] [--networkIngressBytes <BigInt>] [--podCount <Int>] [--storageBytes <BigInt>]
```
