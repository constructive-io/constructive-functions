# provisionBucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings. (api target)

## Usage

```bash
constructive-functions api:provision-bucket --input.bucketKey <String> --input.ownerId <UUID>
```

## Examples

### Run provisionBucket

```bash
constructive-functions api:provision-bucket --input.bucketKey <String> --input.ownerId <UUID>
```
