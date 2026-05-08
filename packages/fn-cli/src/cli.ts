import minimist from 'minimist';
import { commands, type CommandFn } from './commands';

const HELP = `Usage: fn <command> [options]

Commands:
  init <name>  Scaffold a new function under functions/<name>/
               Flags: --type=node-graphql|python (default: node-graphql)
                      --description=<d>  --force  --no-tty
  generate     Generate workspace packages, k8s YAML, configmaps, skaffold.yaml
               Flags: --only=<name>  --packages-only
  build        Run \`pnpm -r build\` (optionally filtered)
               Flags: --only=<name>
  dev          Start functions as local Node processes
               Flags: --only=<name>
  manifest     Print the on-disk functions-manifest.json
  verify       Sanity-check generated/ vs functions/ (no writes)
  help         Print this message

Common flags:
  --root=<dir>   Repo root (default: cwd)
  --config=<f>   Path to fn.config.json (default: <root>/fn.config.json)
`;

export const run = async (argv: string[] = process.argv.slice(2)): Promise<number> => {
  const parsed = minimist(argv, {
    string: ['only', 'config', 'root', 'type', 'name', 'description'],
    boolean: ['packages-only', 'help', 'version', 'no-tty', 'force'],
    alias: { h: 'help', v: 'version' },
  });

  const [name] = parsed._;

  if (parsed.help || name === 'help' || (!name && argv.length === 0)) {
    process.stdout.write(HELP);
    return 0;
  }

  if (parsed.version) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    process.stdout.write(`${pkg.version}\n`);
    return 0;
  }

  const cmd: CommandFn | undefined = commands[name];
  if (!cmd) {
    process.stderr.write(`Unknown command: ${name}\n\n${HELP}`);
    return 1;
  }
  return cmd(parsed);
};
