# platformFunctionDefinition

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionDefinition records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-definition list
constructive-functions compute:platform-function-definition list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-definition list --limit 10 --after <cursor>
constructive-functions compute:platform-function-definition find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-definition get --id <UUID>
constructive-functions compute:platform-function-definition create --name <String> --scope <String> --taskIdentifier <String> [--description <String>] [--isBuiltIn <Boolean>] [--isInvocable <Boolean>] [--maxAttempts <Int>] [--namespaceId <UUID>] [--priority <Int>] [--queueName <String>] [--serviceUrl <String>] [--requiredConfigs <FunctionRequirement>] [--requiredSecrets <FunctionRequirement>]
constructive-functions compute:platform-function-definition update --id <UUID> [--description <String>] [--isBuiltIn <Boolean>] [--isInvocable <Boolean>] [--maxAttempts <Int>] [--name <String>] [--namespaceId <UUID>] [--priority <Int>] [--queueName <String>] [--scope <String>] [--serviceUrl <String>] [--taskIdentifier <String>] [--requiredConfigs <FunctionRequirement>] [--requiredSecrets <FunctionRequirement>]
constructive-functions compute:platform-function-definition delete --id <UUID>
```

## Examples

### List platformFunctionDefinition records

```bash
constructive-functions compute:platform-function-definition list
```

### List platformFunctionDefinition records with pagination

```bash
constructive-functions compute:platform-function-definition list --limit 10 --offset 0
```

### List platformFunctionDefinition records with cursor pagination

```bash
constructive-functions compute:platform-function-definition list --limit 10 --after <cursor>
```

### Find first matching platformFunctionDefinition

```bash
constructive-functions compute:platform-function-definition find-first --where.id.equalTo <value>
```

### List platformFunctionDefinition records with filtering and ordering

```bash
constructive-functions compute:platform-function-definition list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionDefinition

```bash
constructive-functions compute:platform-function-definition create --name <String> --scope <String> --taskIdentifier <String> [--description <String>] [--isBuiltIn <Boolean>] [--isInvocable <Boolean>] [--maxAttempts <Int>] [--namespaceId <UUID>] [--priority <Int>] [--queueName <String>] [--serviceUrl <String>] [--requiredConfigs <FunctionRequirement>] [--requiredSecrets <FunctionRequirement>]
```
