import { useState, useMemo } from 'react';
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

const ANSI_COLORS: Record<string, string> = {
  '30': '#6b7280', '31': '#ef4444', '32': '#22c55e', '33': '#eab308',
  '34': '#3b82f6', '35': '#a855f7', '36': '#06b6d4', '37': '#d4d4d8',
  '39': '#a1a1aa', '90': '#71717a', '91': '#f87171', '92': '#4ade80',
  '93': '#facc15', '94': '#60a5fa', '95': '#c084fc', '96': '#22d3ee', '97': '#fafafa',
};

function ansiToHtml(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\x1b\[([0-9;]+)m/g, (_match, codes: string) => {
    const parts = codes.split(';');
    const spans: string[] = [];
    for (const code of parts) {
      if (code === '0') {
        spans.push('</span>');
      } else if (code === '1') {
        spans.push('<span style="font-weight:bold">');
      } else if (code === '22') {
        spans.push('</span>');
      } else if (ANSI_COLORS[code]) {
        spans.push(`<span style="color:${ANSI_COLORS[code]}">`);
      }
    }
    return spans.join('');
  });

  // Strip any remaining escape sequences
  html = html.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');

  return html;
}

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

  const outputHtml = useMemo(() => {
    if (!result) return '';
    return ansiToHtml(result.output || '(no output)');
  }, [result]);

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
        <div className={`rounded border ${
          result.exitCode === 0
            ? 'bg-zinc-900/50 border-zinc-800'
            : 'bg-red-950/30 border-red-900'
        }`}>
          <pre
            className={`text-xs font-mono p-3 whitespace-pre-wrap ${
              result.exitCode === 0 ? 'text-zinc-400' : 'text-red-300'
            }`}
            dangerouslySetInnerHTML={{ __html: outputHtml }}
          />
          <div className={`text-xs font-mono px-3 py-1.5 border-t ${
            result.exitCode === 0
              ? 'border-zinc-800 text-zinc-600'
              : 'border-red-900 text-red-400'
          }`}>
            exit: {result.exitCode}
          </div>
        </div>
      )}
    </div>
  );
}
