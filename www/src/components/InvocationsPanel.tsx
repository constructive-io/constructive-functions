import { useEffect, useState, useCallback } from 'react';
import { api, type Invocation } from '../lib/api';
import { RefreshCw, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

export function InvocationsPanel() {
  const [invocations, setInvocations] = useState<Invocation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    api.getInvocations().then(setInvocations).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Invocations</h2>
        <button
          onClick={refresh}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {invocations.map((inv) => (
          <InvocationRow key={inv.id} inv={inv} />
        ))}
        {!loading && invocations.length === 0 && (
          <p className="text-zinc-500 text-sm">No invocations yet. Trigger a job to see them here.</p>
        )}
      </div>
    </div>
  );
}

function InvocationRow({ inv }: { inv: Invocation }) {
  const StatusIcon = {
    completed: CheckCircle,
    failed: XCircle,
    running: Loader,
    pending: Clock,
  }[inv.status] || Clock;

  const statusColor = {
    completed: 'text-emerald-400',
    failed: 'text-red-400',
    running: 'text-blue-400',
    pending: 'text-zinc-500',
  }[inv.status] || 'text-zinc-500';

  return (
    <div className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
      <StatusIcon size={14} className={`${statusColor} ${inv.status === 'running' ? 'animate-spin' : ''}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-200">{inv.function_name}</span>
          <span className="text-xs text-zinc-600">job #{inv.job_id}</span>
        </div>
        {inv.error_message && (
          <p className="text-xs text-red-400 truncate mt-0.5">{inv.error_message}</p>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500 shrink-0">
        {inv.duration_ms != null && <span>{inv.duration_ms}ms</span>}
        <span className={`px-1.5 py-0.5 rounded ${statusColor} bg-zinc-800`}>
          {inv.status}
        </span>
      </div>
    </div>
  );
}
