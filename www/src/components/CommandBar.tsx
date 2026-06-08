import { useState } from 'react';
import { api } from '../lib/api';
import { Play, Loader } from 'lucide-react';

const COMMANDS = [
  { label: 'Status', command: 'make status' },
  { label: 'Verify Platform', command: 'make verify-platform' },
  { label: 'Check Env', command: 'make check-env' },
  { label: 'Up', command: 'make up' },
  { label: 'Down', command: 'make down' },
  { label: 'Email Job Up', command: 'make up:email-job' },
  { label: 'Email Job Down', command: 'make down:email-job' },
];

export function CommandBar() {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ output: string; exitCode: number } | null>(null);

  const run = async (command: string) => {
    setRunning(command);
    setResult(null);
    try {
      const res = await api.runCommand(command);
      setResult(res);
    } catch (err: any) {
      setResult({ output: err.message, exitCode: 1 });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {COMMANDS.map(({ label, command }) => (
          <button
            key={command}
            onClick={() => run(command)}
            disabled={running !== null}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs text-zinc-300 transition-colors"
          >
            {running === command ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
            {label}
          </button>
        ))}
      </div>
      {result && (
        <pre className={`text-xs font-mono p-3 rounded border overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap ${
          result.exitCode === 0
            ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
            : 'bg-red-950/30 border-red-900 text-red-300'
        }`}>
          {result.output || '(no output)'}
          {'\n'}exit: {result.exitCode}
        </pre>
      )}
    </div>
  );
}
