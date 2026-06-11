# platformFunctionGraphCommit

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Commit history — each commit snapshots a tree root for a store

## Usage

```typescript
usePlatformFunctionGraphCommitsQuery({ selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } } })
usePlatformFunctionGraphCommitQuery({ id: '<UUID>', selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } } })
useCreatePlatformFunctionGraphCommitMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionGraphCommitMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionGraphCommitMutation({})
```

## Examples

### List all platformFunctionGraphCommits

```typescript
const { data, isLoading } = usePlatformFunctionGraphCommitsQuery({
  selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } },
});
```

### Create a platformFunctionGraphCommit

```typescript
const { mutate } = useCreatePlatformFunctionGraphCommitMutation({
  selection: { fields: { id: true } },
});
mutate({ authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' });
```
