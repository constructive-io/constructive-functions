import { useEffect, useState } from 'react';
import { api, type PlatformFunction } from '../lib/api';
import { RefreshCw, Zap, Lock, Settings } from 'lucide-react';

export function FunctionsPanel() {
  const [functions, setFunctions] = useState<PlatformFunction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    api.getFunctions().then(setFunctions).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Functions</h2>
        <button
          onClick={refresh}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {functions.map((fn) => (
          <FunctionCard key={fn.name} fn={fn} />
        ))}
        {!loading && functions.length === 0 && (
          <p className="text-zinc-500 text-sm">No functions found. Run <code className="text-amber-400">make up</code> to deploy.</p>
        )}
      </div>
    </div>
  );
}

function FunctionCard({ fn }: { fn: PlatformFunction }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className={fn.is_invocable ? 'text-emerald-400' : 'text-zinc-600'} />
          <span className="font-mono text-sm text-zinc-200">{fn.name}</span>
        </div>
        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
          {fn.scope}
        </span>
      </div>
      {fn.description && (
        <p className="text-xs text-zinc-500">{fn.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="font-mono">{fn.task_identifier}</span>
        {fn.required_secrets?.length > 0 && (
          <span className="flex items-center gap-1">
            <Lock size={10} />
            {fn.required_secrets.length} secret{fn.required_secrets.length !== 1 ? 's' : ''}
          </span>
        )}
        {fn.required_configs?.length > 0 && (
          <span className="flex items-center gap-1">
            <Settings size={10} />
            {fn.required_configs.length} config{fn.required_configs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
