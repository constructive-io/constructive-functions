export type ResolvedSecret = {
  secretName: string;
  secretValue: string | null;
  secretSource: 'database' | 'global' | null;
};

export type SecretsMap = Record<string, string>;

export type ResolveSecretsOptions = {
  functionName: string;
  databaseId: string;
  graphqlUrl: string;
  functionId?: string;
  secretsSchema?: string;
  secretsGetter?: string;
  schemata?: string;
};
