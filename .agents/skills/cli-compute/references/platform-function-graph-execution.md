# platformFunctionGraphExecution

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionGraphExecution records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-graph-execution list
constructive-functions compute:platform-function-graph-execution list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-graph-execution list --limit 10 --after <cursor>
constructive-functions compute:platform-function-graph-execution find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-graph-execution get --id <UUID>
constructive-functions compute:platform-function-graph-execution create --databaseId <UUID> --graphId <UUID> --outputNode <String> [--startedAt <Datetime>] [--completedAt <Datetime>] [--currentWave <Int>] [--definitionsCommitId <UUID>] [--entityId <UUID>] [--errorCode <String>] [--errorMessage <String>] [--executionPlan <JSON>] [--inputPayload <JSON>] [--invocationId <UUID>] [--maxPendingJobs <Int>] [--maxTicks <Int>] [--nodeOutputs <JSON>] [--outputPayload <JSON>] [--outputPort <String>] [--parentExecutionId <UUID>] [--parentNodeName <String>] [--status <String>] [--tickCount <Int>] [--timeoutAt <Datetime>]
constructive-functions compute:platform-function-graph-execution update --id <UUID> [--startedAt <Datetime>] [--completedAt <Datetime>] [--currentWave <Int>] [--databaseId <UUID>] [--definitionsCommitId <UUID>] [--entityId <UUID>] [--errorCode <String>] [--errorMessage <String>] [--executionPlan <JSON>] [--graphId <UUID>] [--inputPayload <JSON>] [--invocationId <UUID>] [--maxPendingJobs <Int>] [--maxTicks <Int>] [--nodeOutputs <JSON>] [--outputNode <String>] [--outputPayload <JSON>] [--outputPort <String>] [--parentExecutionId <UUID>] [--parentNodeName <String>] [--status <String>] [--tickCount <Int>] [--timeoutAt <Datetime>]
constructive-functions compute:platform-function-graph-execution delete --id <UUID>
```

## Examples

### List platformFunctionGraphExecution records

```bash
constructive-functions compute:platform-function-graph-execution list
```

### List platformFunctionGraphExecution records with pagination

```bash
constructive-functions compute:platform-function-graph-execution list --limit 10 --offset 0
```

### List platformFunctionGraphExecution records with cursor pagination

```bash
constructive-functions compute:platform-function-graph-execution list --limit 10 --after <cursor>
```

### Find first matching platformFunctionGraphExecution

```bash
constructive-functions compute:platform-function-graph-execution find-first --where.id.equalTo <value>
```

### List platformFunctionGraphExecution records with filtering and ordering

```bash
constructive-functions compute:platform-function-graph-execution list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionGraphExecution

```bash
constructive-functions compute:platform-function-graph-execution create --databaseId <UUID> --graphId <UUID> --outputNode <String> [--startedAt <Datetime>] [--completedAt <Datetime>] [--currentWave <Int>] [--definitionsCommitId <UUID>] [--entityId <UUID>] [--errorCode <String>] [--errorMessage <String>] [--executionPlan <JSON>] [--inputPayload <JSON>] [--invocationId <UUID>] [--maxPendingJobs <Int>] [--maxTicks <Int>] [--nodeOutputs <JSON>] [--outputPayload <JSON>] [--outputPort <String>] [--parentExecutionId <UUID>] [--parentNodeName <String>] [--status <String>] [--tickCount <Int>] [--timeoutAt <Datetime>]
```
