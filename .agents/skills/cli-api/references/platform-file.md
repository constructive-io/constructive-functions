# platformFile

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFile records via constructive-functions CLI (api target)

## Usage

```bash
constructive-functions api:platform-file list
constructive-functions api:platform-file list --where.<field>.<op> <value> --orderBy <values>
constructive-functions api:platform-file list --limit 10 --after <cursor>
constructive-functions api:platform-file find-first --where.<field>.<op> <value>
constructive-functions api:platform-file get --id <UUID>
constructive-functions api:platform-file create --actorId <UUID> --bucketId <UUID> --databaseId <UUID> --key <String> --mimeType <String> --size <BigInt> [--contentHash <String>] [--description <String>] [--filename <String>] [--isPublic <Boolean>] [--tags <String>] [--upload <Upload>] [--status <FileStatus>]
constructive-functions api:platform-file update --id <UUID> [--actorId <UUID>] [--bucketId <UUID>] [--contentHash <String>] [--databaseId <UUID>] [--description <String>] [--filename <String>] [--isPublic <Boolean>] [--key <String>] [--mimeType <String>] [--size <BigInt>] [--tags <String>] [--upload <Upload>] [--status <FileStatus>]
constructive-functions api:platform-file delete --id <UUID>
```

## Examples

### List platformFile records

```bash
constructive-functions api:platform-file list
```

### List platformFile records with pagination

```bash
constructive-functions api:platform-file list --limit 10 --offset 0
```

### List platformFile records with cursor pagination

```bash
constructive-functions api:platform-file list --limit 10 --after <cursor>
```

### Find first matching platformFile

```bash
constructive-functions api:platform-file find-first --where.id.equalTo <value>
```

### List platformFile records with filtering and ordering

```bash
constructive-functions api:platform-file list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFile

```bash
constructive-functions api:platform-file create --actorId <UUID> --bucketId <UUID> --databaseId <UUID> --key <String> --mimeType <String> --size <BigInt> [--contentHash <String>] [--description <String>] [--filename <String>] [--isPublic <Boolean>] [--tags <String>] [--upload <Upload>] [--status <FileStatus>]
```
