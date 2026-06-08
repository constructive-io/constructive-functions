import { useEffect, useState } from 'react';
import { api, type PlatformStatus } from '../lib/api';
import { Database, Cpu, Briefcase, Activity } from 'lucide-react';

export function StatusBar() {
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    api.getStatus().then(setStatus).catch((e) => setError(e.message));
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-950/50 border-b border-red-800 text-red-300 text-sm">
        <span>Connection error: {error}</span>
        <button onClick={refresh} className="ml-auto underline text-red-400 hover:text-red-200">
          Retry
        </button>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-sm">
        Connecting...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-sm">
      <div className="flex items-center gap-1.5 text-emerald-400">
        <Database size={14} />
        <span>{status.database}</span>
        <span className="text-zinc-500">({status.postgres})</span>
      </div>
      <div className="flex items-center gap-1.5 text-blue-400">
        <Cpu size={14} />
        <span>{status.functions} function{status.functions !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-1.5 text-amber-400">
        <Briefcase size={14} />
        <span>{status.jobs} job{status.jobs !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-1.5 text-purple-400">
        <Activity size={14} />
        <span>{status.invocations} invocation{status.invocations !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
