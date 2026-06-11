# user

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for User data operations

## Usage

```typescript
useUsersQuery({ selection: { fields: { createdAt: true, displayName: true, id: true, profilePicture: true, searchTsv: true, type: true, updatedAt: true, username: true, searchTsvRank: true, displayNameTrgmSimilarity: true, searchScore: true } } })
useUserQuery({ id: '<UUID>', selection: { fields: { createdAt: true, displayName: true, id: true, profilePicture: true, searchTsv: true, type: true, updatedAt: true, username: true, searchTsvRank: true, displayNameTrgmSimilarity: true, searchScore: true } } })
useCreateUserMutation({ selection: { fields: { id: true } } })
useUpdateUserMutation({ selection: { fields: { id: true } } })
useDeleteUserMutation({})
```

## Examples

### List all users

```typescript
const { data, isLoading } = useUsersQuery({
  selection: { fields: { createdAt: true, displayName: true, id: true, profilePicture: true, searchTsv: true, type: true, updatedAt: true, username: true, searchTsvRank: true, displayNameTrgmSimilarity: true, searchScore: true } },
});
```

### Create a user

```typescript
const { mutate } = useCreateUserMutation({
  selection: { fields: { id: true } },
});
mutate({ displayName: '<String>', profilePicture: '<Image>', searchTsv: '<FullText>', type: '<Int>', username: '<String>', searchTsvRank: '<Float>', displayNameTrgmSimilarity: '<Float>', searchScore: '<Float>' });
```
