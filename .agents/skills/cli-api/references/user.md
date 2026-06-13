# user

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for User records via constructive-functions CLI (api target)

**Unified Search API fields:** `searchTsv`, `displayNameTrgmSimilarity`, `searchScore`
Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

## Usage

```bash
constructive-functions api:user list
constructive-functions api:user list --where.<field>.<op> <value> --orderBy <values>
constructive-functions api:user list --limit 10 --after <cursor>
constructive-functions api:user find-first --where.<field>.<op> <value>
constructive-functions api:user search <query>
constructive-functions api:user get --id <UUID>
constructive-functions api:user create [--displayName <String>] [--profilePicture <Image>] [--type <Int>] [--username <String>]
constructive-functions api:user update --id <UUID> [--displayName <String>] [--profilePicture <Image>] [--type <Int>] [--username <String>]
constructive-functions api:user delete --id <UUID>
```

## Examples

### List user records

```bash
constructive-functions api:user list
```

### List user records with pagination

```bash
constructive-functions api:user list --limit 10 --offset 0
```

### List user records with cursor pagination

```bash
constructive-functions api:user list --limit 10 --after <cursor>
```

### Find first matching user

```bash
constructive-functions api:user find-first --where.id.equalTo <value>
```

### List user records with filtering and ordering

```bash
constructive-functions api:user list --where.id.equalTo <value> --orderBy ID_ASC
```

### Full-text search via tsvector (`searchTsv`)

```bash
constructive-functions api:user list --where.searchTsv "search query" --select title,tsvRank
```

### Fuzzy search via trigram similarity (`trgmDisplayName`)

```bash
constructive-functions api:user list --where.trgmDisplayName.value "approximate query" --where.trgmDisplayName.threshold 0.3 --select title,displayNameTrgmSimilarity
```

### Composite search (unifiedSearch dispatches to all text adapters)

```bash
constructive-functions api:user list --where.unifiedSearch "search query" --select title,tsvRank,displayNameTrgmSimilarity,searchScore
```

### Search with pagination and field projection

```bash
constructive-functions api:user list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
constructive-functions api:user search "query" --limit 10 --select id,title,searchScore
```

### Create a user

```bash
constructive-functions api:user create [--displayName <String>] [--profilePicture <Image>] [--type <Int>] [--username <String>]
```
