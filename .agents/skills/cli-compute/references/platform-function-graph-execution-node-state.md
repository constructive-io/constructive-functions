# platformFunctionGraphExecutionNodeState

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionGraphExecutionNodeState records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-graph-execution-node-state list
constructive-functions compute:platform-function-graph-execution-node-state list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-graph-execution-node-state list --limit 10 --after <cursor>
constructive-functions compute:platform-function-graph-execution-node-state find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-graph-execution-node-state get --id <UUID>
constructive-functions compute:platform-function-graph-execution-node-state create --databaseId <UUID> --executionId <UUID> --nodeName <String> [--completedAt <Datetime>] [--errorCode <String>] [--errorMessage <String>] [--outputId <UUID>] [--startedAt <Datetime>] [--status <String>] [--nodePath <String>]
constructive-functions compute:platform-function-graph-execution-node-state update --id <UUID> [--completedAt <Datetime>] [--databaseId <UUID>] [--errorCode <String>] [--errorMessage <String>] [--executionId <UUID>] [--nodeName <String>] [--outputId <UUID>] [--startedAt <Datetime>] [--status <String>] [--nodePath <String>]
constructive-functions compute:platform-function-graph-execution-node-state delete --id <UUID>
```

## Examples

### List platformFunctionGraphExecutionNodeState records

```bash
constructive-functions compute:platform-function-graph-execution-node-state list
```

### List platformFunctionGraphExecutionNodeState records with pagination

```bash
constructive-functions compute:platform-function-graph-execution-node-state list --limit 10 --offset 0
```

### List platformFunctionGraphExecutionNodeState records with cursor pagination

```bash
constructive-functions compute:platform-function-graph-execution-node-state list --limit 10 --after <cursor>
```

### Find first matching platformFunctionGraphExecutionNodeState

```bash
constructive-functions compute:platform-function-graph-execution-node-state find-first --where.id.equalTo <value>
```

### List platformFunctionGraphExecutionNodeState records with filtering and ordering

```bash
constructive-functions compute:platform-function-graph-execution-node-state list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionGraphExecutionNodeState

```bash
constructive-functions compute:platform-function-graph-execution-node-state create --databaseId <UUID> --executionId <UUID> --nodeName <String> [--completedAt <Datetime>] [--errorCode <String>] [--errorMessage <String>] [--outputId <UUID>] [--startedAt <Datetime>] [--status <String>] [--nodePath <String>]
```
