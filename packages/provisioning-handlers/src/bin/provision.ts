#!/usr/bin/env node
/**
 * CLI entry point for the provisioning seed.
 *
 * Usage:
 *   pnpm provision                            # provision everything
 *   pnpm provision --namespace my-app         # provision one namespace
 *   pnpm provision --function send-email      # provision one function
 *
 * Environment:
 *   K8S_API_URL     — K8s API endpoint (required)
 *   DATABASE_URL    — PostgreSQL connection string (required)
 *   DATABASE_ID     — platform database id (defaults to zeros UUID)
 */

import { Pool } from 'pg';

import { provision } from '../seed';

const DEFAULT_DATABASE_ID = '00000000-0000-0000-0000-000000000000';

function parseArgs(argv: string[]) {
  const args: Record<string, string | undefined> = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--namespace' && argv[i + 1]) {
      args.namespace = argv[++i];
    } else if (argv[i] === '--function' && argv[i + 1]) {
      args.functionName = argv[++i];
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log(`Usage: provision [--namespace <name>] [--function <name>]

Provisions K8s infrastructure from the current database state.

Options:
  --namespace <name>   Only provision this namespace
  --function <name>    Only provision this function
  --help, -h           Show this help message

Environment:
  K8S_API_URL          K8s API endpoint (required)
  DATABASE_URL         PostgreSQL connection string (required)
  DATABASE_ID          Platform database ID (default: ${DEFAULT_DATABASE_ID})
`);
      process.exit(0);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!process.env.K8S_API_URL) {
    console.error('Error: K8S_API_URL environment variable is required');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await provision({
      pool,
      databaseId: process.env.DATABASE_ID || DEFAULT_DATABASE_ID,
      namespace: args.namespace,
      functionName: args.functionName,
    });

    console.log('\n── Provisioning Summary ──');
    console.log(`Namespaces: ${result.namespaces.length}`);
    for (const ns of result.namespaces) {
      console.log(`  ${ns.status === 'created' ? '+' : '='} ${ns.name} (${ns.status})`);
    }
    console.log(`Secrets: ${result.secrets.length}`);
    for (const s of result.secrets) {
      console.log(`  ${s.status === 'synced' ? '+' : '-'} ${s.namespace} (${s.count} keys, ${s.status})`);
    }
    console.log(`Functions: ${result.functions.length}`);
    for (const fn of result.functions) {
      console.log(`  ${fn.status === 'created' ? '+' : '='} ${fn.name} → ${fn.serviceUrl ?? '(pending)'} (${fn.status})`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Provisioning failed:', err);
  process.exit(1);
});
