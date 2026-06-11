# platformBucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformBucket records via constructive-functions CLI (api target)

## Usage

```bash
constructive-functions api:platform-bucket list
constructive-functions api:platform-bucket list --where.<field>.<op> <value> --orderBy <values>
constructive-functions api:platform-bucket list --limit 10 --after <cursor>
constructive-functions api:platform-bucket find-first --where.<field>.<op> <value>
constructive-functions api:platform-bucket get --id <UUID>
constructive-functions api:platform-bucket create --actorId <UUID> --databaseId <UUID> --key <String> [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--description <String>] [--isPublic <Boolean>] [--maxFileSize <BigInt>] [--type <String>]
constructive-functions api:platform-bucket update --id <UUID> [--actorId <UUID>] [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--databaseId <UUID>] [--description <String>] [--isPublic <Boolean>] [--key <String>] [--maxFileSize <BigInt>] [--type <String>]
constructive-functions api:platform-bucket delete --id <UUID>
```

## Examples

### List platformBucket records

```bash
constructive-functions api:platform-bucket list
```

### List platformBucket records with pagination

```bash
constructive-functions api:platform-bucket list --limit 10 --offset 0
```

### List platformBucket records with cursor pagination

```bash
constructive-functions api:platform-bucket list --limit 10 --after <cursor>
```

### Find first matching platformBucket

```bash
constructive-functions api:platform-bucket find-first --where.id.equalTo <value>
```

### List platformBucket records with filtering and ordering

```bash
constructive-functions api:platform-bucket list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformBucket

```bash
constructive-functions api:platform-bucket create --actorId <UUID> --databaseId <UUID> --key <String> [--allowCustomKeys <Boolean>] [--allowedMimeTypes <String>] [--allowedOrigins <String>] [--description <String>] [--isPublic <Boolean>] [--maxFileSize <BigInt>] [--type <String>]
```
