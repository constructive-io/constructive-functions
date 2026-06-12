# platformUsageDaily

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformUsageDaily records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-usage-daily list
constructive-functions compute:platform-usage-daily list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-usage-daily list --limit 10 --after <cursor>
constructive-functions compute:platform-usage-daily find-first --where.<field>.<op> <value>
constructive-functions compute:platform-usage-daily get --id <UUID>
constructive-functions compute:platform-usage-daily create --taskIdentifier <String> --date <Date> [--databaseId <UUID>] [--entityId <UUID>] [--organizationId <UUID>] [--entityType <String>] [--totalCalls <BigInt>] [--successful <BigInt>] [--failed <BigInt>] [--totalDurationMs <BigInt>] [--minDurationMs <Int>] [--maxDurationMs <Int>]
constructive-functions compute:platform-usage-daily update --id <UUID> [--databaseId <UUID>] [--entityId <UUID>] [--organizationId <UUID>] [--entityType <String>] [--taskIdentifier <String>] [--date <Date>] [--totalCalls <BigInt>] [--successful <BigInt>] [--failed <BigInt>] [--totalDurationMs <BigInt>] [--minDurationMs <Int>] [--maxDurationMs <Int>]
constructive-functions compute:platform-usage-daily delete --id <UUID>
```

## Examples

### List platformUsageDaily records

```bash
constructive-functions compute:platform-usage-daily list
```

### List platformUsageDaily records with pagination

```bash
constructive-functions compute:platform-usage-daily list --limit 10 --offset 0
```

### List platformUsageDaily records with cursor pagination

```bash
constructive-functions compute:platform-usage-daily list --limit 10 --after <cursor>
```

### Find first matching platformUsageDaily

```bash
constructive-functions compute:platform-usage-daily find-first --where.id.equalTo <value>
```

### List platformUsageDaily records with filtering and ordering

```bash
constructive-functions compute:platform-usage-daily list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformUsageDaily

```bash
constructive-functions compute:platform-usage-daily create --taskIdentifier <String> --date <Date> [--databaseId <UUID>] [--entityId <UUID>] [--organizationId <UUID>] [--entityType <String>] [--totalCalls <BigInt>] [--successful <BigInt>] [--failed <BigInt>] [--totalDurationMs <BigInt>] [--minDurationMs <Int>] [--maxDurationMs <Int>]
```
